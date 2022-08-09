import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from '@mui/material';

export default function NewFolderDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'md'}
    >
      <DialogTitle id="alert-dialog-title" style={{ margin: 'auto' }}>
        New Folder
      </DialogTitle>
      <DialogContent>
        <div style={{ width: 600, margin: 'auto' }}>
          <input
            placeholder="Enter folder name here"
            onChange={(e) => props.handleChange(e.target.value)}
            type="text"
            style={{ width: '100%', marginBottom: 10 }}
          />
          <Grid container spacing={1}>
            <Grid item xs></Grid>
            <Grid item>
              <Button
                color="primary"
                component="span"
                onClick={props.createNewFolder}
              >
                Save
              </Button>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                component="span"
                onClick={props.closeDialog}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </div>
      </DialogContent>
    </Dialog>
  );
}
