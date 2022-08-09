import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  CircularProgress,
  MenuItem,
  Select,
} from '@mui/material';

export default function EditViewDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'lg'}
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent style={{ width: 400 }}>
        <div class="dialog-input">
          <Select
            defaultValue={props.position}
            style={{ width: '100%' }}
            onChange={(e) => props.setPosition(parseInt(e.target.value))}
          >
            {Object.values(props.views).map((view, index) => {
              return (
                <MenuItem key={index} value={view.position}>
                  {index + 1}
                </MenuItem>
              );
            })}
          </Select>
        </div>
        <div class="dialog-input">
          <input
            placeholder="Enter view name here"
            type="text"
            style={{ width: '97%' }}
            defaultValue={props.name}
            onChange={(e) => props.setName(e.target.value)}
          />
        </div>
        <div class="dialog-input">
          <input
            placeholder="Enter description here"
            type="text"
            style={{ width: '97%' }}
            defaultValue={props.description}
            onChange={(e) => props.setDescription(e.target.value)}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.action} color="primary" autoFocus>
          {props.actionProcess && <CircularProgress size={24} />}
          {!props.actionProcess && 'Update'}
        </Button>
        <Button onClick={props.closeDialog} color="primary" autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
