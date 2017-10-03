import {Router, Request, Response, NextFunction} from 'express';
import * as path from 'path';
import * as fs from 'fs';

const privateSetupPath = path.join(__dirname, '..', 'config', 'setup.private.json');
const initialSetupPath = path.join(__dirname, '..', 'config', 'setup.initial.json');

// Template/Dashboard metadata is stored inside the files
// To read the metadata we could eval() the files, but that's dangerous.
// Instead, we use regular expressions to pull them out
// Assumes that:
// * the metadata comes before config information
// * fields in the file look like fieldname: "string" or fieldname: 'string'
// * or, special case, html: `string`

const fields = {
  id: /\s*id:\s*("|')(.*)("|')/,
  name: /\s*name:\s*("|')(.*)("|')/,
  description: /\s*description:\s*("|')(.*)("|')/,
  icon: /\s*icon:\s*("|')(.*)("|')/,
  logo: /\s*logo:\s*("|')(.*)("|')/,
  url: /\s*url:\s*("|')(.*)("|')/,
  preview: /\s*preview:\s*("|')(.*)("|')/,
  category: /\s*category:\s*("|')(.*)("|')/,
  html: /\s*html:\s*(`)([\s\S]*?)(`)/gm,
  featured: /\s*featured:\s*(true|false)/,
}

const getField = (regExp, text) => {
  regExp.lastIndex = 0;
  const matches = regExp.exec(text);
  let match = matches && matches.length >= 3 && matches[2];
  if (!match) {
    match = matches && matches.length > 0 && matches[0];
  }
  return match;
}

const getMetadata = (text) => {
  const metadata = {}
  for (let key in fields) {
    metadata[key] = getField(fields[key], text);
  }
  return metadata;
}

const paths = () => ({
  privateDashboard: path.join(__dirname, '..', 'dashboards'),
  preconfDashboard: path.join(__dirname, '..', 'dashboards', 'preconfigured'),
  privateTemplate: path.join(__dirname, '..', 'dashboards', 'customTemplates')
});

const isValidFile = (filePath) => {
  const stats = fs.statSync(filePath);
  return stats.isFile() && (filePath.endsWith('.js') || filePath.endsWith('.ts'));
}

const getFileContents = (filePath) => {
  let contents = fs.readFileSync(filePath, 'utf8');
  return filePath.endsWith(".ts")
    ? "return " + contents.slice(contents.indexOf("/*return*/ {") + 10)
    : contents;
}

const ensureCustomTemplatesFolderExists = () => {
  const { privateTemplate } = paths();

  if (!fs.existsSync(privateTemplate)) {
    fs.mkdirSync(privateTemplate);
  }
}

export class ApiRoute {
  router : Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public GetDashboards(req: Request, res: Response) {
    const { privateDashboard, preconfDashboard, privateTemplate } = paths();
    
    let script = '';
    let files = fs.readdirSync(privateDashboard);
    files = (files || []).filter(fileName => isValidFile(path.join(privateDashboard, fileName)));
    
      // In case no dashboard is present, create a new sample file
    if (!files || !files.length) {
      const sampleFileName = 'basic_sample.private.js';
      const sampleTemplatePath = path.join(preconfDashboard, 'sample.ts');
      const samplePath = path.join(privateDashboard, sampleFileName);
      let content = getFileContents(sampleTemplatePath);
    
      fs.writeFileSync(samplePath, content);
      files = [ sampleFileName ];
    }
    
    if (files && files.length) {
      files.forEach((fileName) => {
        const filePath = path.join(privateDashboard, fileName);
        const fileContents = getFileContents(filePath);
        const jsonDefinition = getMetadata(fileContents);
        let content = 'return ' + JSON.stringify(jsonDefinition);
    
        // Ensuing this dashboard is loaded into the dashboards array on the page
        script += `
          (function (window) {
            var dashboard = (function () {
              ${content}
            })();
            window.dashboardDefinitions = window.dashboardDefinitions || [];
            window.dashboardDefinitions.push(dashboard);
          })(window);
          `;
        });
    }
    
    // read preconfigured templates and custom templates
    let templates = fs.readdirSync(preconfDashboard);
    if (templates && templates.length) {
      templates.forEach((fileName) => {
        let filePath = path.join(preconfDashboard, fileName);
        if (isValidFile(filePath)) {
          const fileContents = getFileContents(filePath);
          const jsonDefinition = getMetadata(fileContents);
          let content = 'return ' + JSON.stringify(jsonDefinition);
    
          // Ensuing this dashboard is loaded into the dashboards array on the page
          script += `
            (function (window) {
              var dashboardTemplate = (function () {
                ${content}
              })();
              window.dashboardTemplates = window.dashboardTemplates || [];
              window.dashboardTemplates.push(dashboardTemplate);
            })(window);
          `;
        }
      });
    }
    
    ensureCustomTemplatesFolderExists();
    let customTemplates = fs.readdirSync(privateTemplate);
    if (customTemplates && customTemplates.length) {
      customTemplates.forEach((fileName) => {
        let filePath = path.join(privateTemplate, fileName);
        if (isValidFile(filePath)) {
          const fileContents = getFileContents(filePath);
          const jsonDefinition = getMetadata(fileContents);
          let content = 'return ' + JSON.stringify(jsonDefinition);
    
          // Ensuing this dashboard is loaded into the dashboards array on the page
          script += `
            (function (window) {
              var dashboardTemplate = (function () {
                ${content}
              })();
              window.dashboardTemplates = window.dashboardTemplates || [];
              window.dashboardTemplates.push(dashboardTemplate);
            })(window);
            `;
        }
      });
    }
    
    res.send(script);
  }

  public GetDashboard(req: Request, res: Response) {
    let dashboardId = req.params.id;
    const { privateDashboard } = paths();
  
    let script = '';
    let dashboardFile = this.getFileById(privateDashboard, dashboardId);
    if (dashboardFile) {
      let filePath = path.join(privateDashboard, dashboardFile);
      if (isValidFile(filePath)) {
        const content = getFileContents(filePath);
  
        if (req.query.format && req.query.format === 'raw') {
          res.send(content); // allows request for raw text string
        }
  
        // Ensuing this dashboard is loaded into the dashboards array on the page
        script += `
          (function (window) {
            var dashboard = (function () {
              ${content}
            })();
            window.dashboard = dashboard || null;
          })(window);
        `;
      }
    }
  
    res.send(script);
  }

  public CreateDashboard(req: Request, res: Response) {
    let { id } = req.params;
    let { script } = req.body || '';
  
    const { privateDashboard } = paths();
    let dashboardFile = this.getFileById(privateDashboard, id);
    let filePath = path.join(privateDashboard, dashboardFile);
  
    fs.writeFile(filePath, script, err => {
      if (err) {
        console.error(err);
        return res.end(err);
      }
  
      res.json({ script });
    });
  }

  public UpdateDashboard(req: Request, res: Response) {
    let { id } = req.params;
    let { script } = req.body;
  
    if (!id || !script) {
      res.json({ error: 'No id or script were supplied for the new dashboard', type: 'id'} );
      return;
    }
  
    const { privateDashboard } = paths();
    let dashboardPath = path.join(privateDashboard, id + '.private.js');
    let dashboardFile = this.getFileById(privateDashboard, id);
    let dashboardExists = fs.existsSync(dashboardPath);
  
    if (dashboardFile || dashboardExists) {
      res.json({ error: 'Dashboard id or filename already exists', type: 'id'} );
      return;
    }
  
    fs.writeFile(dashboardPath, script, err => {
      if (err) {
        console.error(err);
        res.end(err);

        return;
      }
  
      res.json({ script });
    });
  }

  private getFileById(dir, id, overwrite?) {
    let files = fs.readdirSync(dir) || [];
  
    // Make sure the array only contains files
    files = files.filter(fileName => fs.statSync(path.join(dir, fileName)).isFile());
    if (!files || files.length === 0) {
      return null;
    }
  
    let dashboardFile = null;
    files.every(fileName => {
      const filePath = path.join(dir, fileName);
      if (isValidFile(filePath)) {
        let dashboardId = undefined;
        if (overwrite === true) {
          dashboardId = path.parse(fileName).name;
          if (dashboardId.endsWith('.private')) {
            dashboardId = path.parse(dashboardId).name;
          }
        } else {
          const fileContents = getFileContents(filePath);
          dashboardId = getField(fields.id, fileContents);
        }
        if (dashboardId && dashboardId === id) {
          dashboardFile = fileName;
          return false;
        }
      }
      return true;
    });
  
    return dashboardFile;
  }

  private init() {
    this.router.get('/', this.GetDashboards);
    this.router.get('/:id*', this.GetDashboard);
    this.router.post('/:id', this.CreateDashboard);
    this.router.put('/:id?', this.CreateDashboard);
  }
}

const apiRouter = new ApiRoute();

export default apiRouter.router;