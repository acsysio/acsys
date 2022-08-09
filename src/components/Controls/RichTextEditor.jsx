import { Grid, Hidden } from '@mui/material';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function RichTextEditor(props) {
  const modules = {
    toolbar: {
      container: [
        [{ font: [] }, { size: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'super' }, { script: 'sub' }],
        [{ header: '1' }, { header: '2' }, 'blockquote', 'code-block'],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        ['direction', { align: [] }],
        ['link', 'image', 'video', 'formula'],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };
  if (props.url.length > 0) {
    const quill = props.quillRef.getEditor();
    quill.insertEmbed(props.index, 'image', props.url);
    props.setQuillURL('');
  }
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <div className="quill-container">
        <ReactQuill
          theme='snow'
          ref={(el) => {
            props.setQuillRef(el);
          }}
          modules={modules}
          value={props.defaultValue || ''}
          onChange={(e) => props.handleChange(props.currentKey, e)}
          style={{
            clear: 'both',
            height: 400,
            marginBottom: 40,
          }}
        />
      </div>
      <Hidden mdUp implementation="css">
        <div style={{ height: 50 }} />
      </Hidden>
      <Hidden smUp implementation="css">
        <div style={{ height: 20 }} />
      </Hidden>
    </Grid>
  );
}
