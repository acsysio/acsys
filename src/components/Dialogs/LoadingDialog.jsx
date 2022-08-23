import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';

export default function LoadingDialog(props) {
  return (
    <Dialog
      open={props.loading}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'md'}
    >
      <DialogTitle id="alert-dialog-title" style={{ margin: 'auto' }}>
        {props.message}
      </DialogTitle>
      <DialogContent
        style={{
          minHeight: 150,
          minWidth: 400,
          margin: 'auto',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: 124, margin: 'auto' }}>
          <CircularProgress size={124} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
