import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@mui/material';

export default function YesNoDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.closeDialog} color="primary">
          No
        </Button>
        <Button
          onClick={props.action}
          color="primary"
          disabled={props.actionProcess}
          autoFocus
        >
          {props.actionProcess && <CircularProgress size={24} />}
          {!props.actionProcess && 'Yes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
