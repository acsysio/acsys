import { Dialog } from '@mui/material';
import Storage from '../../pages/Storage';

export default function StorageDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'md'}
      fullWidth={true}
    >
      <Storage
        mode={props.fileMode}
        doc={props.docDetails}
        control={props.control}
        setFile={props.setReference}
      />
    </Dialog>
  );
}
