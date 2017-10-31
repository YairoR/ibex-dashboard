import * as React from 'react';

import IEditorOptions from 'react-monaco-editor';
import IEditorMinimapOptions from 'react-monaco-editor';

import Button from 'react-md/lib/Buttons/Button';
import MonacoEditor from 'react-monaco-editor';

import './style.css';

interface IQueryEditorProps {
  onChange?(val: string) : void;
  onRunButtonPressed(query: string) : void;
}

interface IQueryEditorState {
  query: string;
}

export default class QueryEditor extends React.Component<IQueryEditorProps, IQueryEditorState> {
  private editor: monaco.editor.ICodeEditor = null;

  constructor(props: any) {
    super(props);

    this.editorDidMount = this.editorDidMount.bind(this);
    this.queryChanged = this.queryChanged.bind(this);

    this.state = {
      query: null
    }; 
  }

  editorDidMount(editor: monaco.editor.ICodeEditor, monacoModule: typeof monaco) {
    this.editor = editor;
    console.log('starting');
  }

  queryChanged(newValue: string, e: monaco.editor.IModelContentChangedEvent) {
    if (this.props.onChange) {
      this.props.onChange(newValue);
    } 

    this.setState({ query: newValue });
  }

  onRunButtonPressed() {
    // Get the current value (query) from the monaco editor
    var query = this.editor.getModel().getValue();

    if (this.props.onRunButtonPressed) {
      this.props.onRunButtonPressed(query);
    }
  }

  getMonacoEditorSettings() : monaco.editor.IEditorOptions {
    var minimapOptions: monaco.editor.IEditorMinimapOptions = {
      enabled: false
    };

    var scrollbarOptions: monaco.editor.IEditorScrollbarOptions = {
      horizontal: "Hidden",
      arrowSize: 30,
      useShadows: false
    };
 
    var editorOptions: monaco.editor.IEditorOptions = {
      minimap: minimapOptions,
      scrollbar: scrollbarOptions,
      lineNumbers: "off",
      lineHeight: 19,
      fontSize: 19,
      suggestFontSize: 13,
      dragAndDrop: false,
      occurrencesHighlight: false,
      selectionHighlight: false,
      renderIndentGuides: false,
      wordWrap: "off",
      wordWrapColumn: 0,
      renderLineHighlight: "none",
      automaticLayout: true           // Auto resize whenever DOM is changing (e.g. zooming)
    };

    return editorOptions;
  }

  render() {    
    return (
      <div>
        <div style={{ marginBottom: '25px',
                      borderStyle: 'groove',
                      borderColor: 'lightgray',
                      borderWidth: '1px' }}>
          <MonacoEditor
            width="100%"
            height="150"
            language="Kusto"
            defaultValue="event | limit 10"
            value={this.state.query}
            theme="vs"
            editorDidMount={this.editorDidMount}
            onChange={this.queryChanged}
            options={this.getMonacoEditorSettings()}
          />
        </div>
        <div>
          <Button primary raised label="Go" style={{ width: 100 }} 
                  onClick={this.onRunButtonPressed.bind(this)} />
        </div>
      </div>
    );
  }
}