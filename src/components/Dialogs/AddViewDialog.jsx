import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';

export default function AddViewDialog(props) {
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
          <select
            onChange={(e) => props.setCollection(e.target.value)}
            className="select-css"
          >
            <option disabled selected value>
              select an option
            </option>
            {props.collectionArr.map((value) => {
              return <option value={value}>{value}</option>;
            })}
          </select>
        </div>
        <div class="dialog-input">
          <input
            className="custom-input"
            value="Position generated on publish"
            readonly
            style={{ width: '97%' }}
          />
        </div>
        <div class="dialog-input">
          <input
            className="custom-input"
            placeholder="Enter view name here"
            type="text"
            style={{ width: '97%' }}
            onChange={(e) => props.setName(e.target.value)}
          />
        </div>
        <div class="dialog-input">
          <input
            className="custom-input"
            placeholder="Enter description here"
            type="text"
            style={{ width: '97%' }}
            onChange={(e) => props.setDescription(e.target.value)}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.action} color="primary" autoFocus>
          {props.actionProcess && <CircularProgress size={24} />}
          {!props.actionProcess && 'Add'}
        </Button>
        <Button onClick={props.closeDialog} color="primary" autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
