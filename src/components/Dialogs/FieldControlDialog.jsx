import { DndProvider } from 'react-dnd';
import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@material-ui/core';

export default function FieldControlDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'lg'}
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description"></DialogContentText>
        <div>
          <DndProvider backend={props.backend}>{props.component}</DndProvider>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.action} color="primary" autoFocus>
          {props.actionProcess && <CircularProgress size={24} />}
          {!props.actionProcess && 'Save'}
        </Button>
        <Button onClick={props.closeDialog} color="primary" autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
