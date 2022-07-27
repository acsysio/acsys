import React from 'react';
import { Dialog, DialogContent } from '@material-ui/core';

export default function ImageDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'lg'}
    >
      <DialogContent
        style={{
          margin: 'auto',
          overflow: 'hidden',
        }}
      >
        <div class="image-container">
          <img
            src={props.imgUrl}
            style={{ height: '50vh', maxWidth: '50vw' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
