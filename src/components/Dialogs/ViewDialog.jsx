import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Grid,
  NativeSelect,
  Typography,
} from '@material-ui/core';

export default function ViewDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth={'sm'}
    >
      <DialogTitle id="alert-dialog-title">View Settings</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description"></DialogContentText>
        <div>
          <Grid container spacing={0}>
            <Grid item xs={3}>
              <div>
                <Typography>Order By Field</Typography>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div>
                <Typography>Order</Typography>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div>
                <Typography>Entries Per Page</Typography>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div>
                <Typography>Update Mode</Typography>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div>
                <NativeSelect
                  defaultValue={props.viewOrderField}
                  onChange={(e) => props.setOrderField(e.target.value)}
                >
                  <option value="none">none</option>
                  {Object.values(props.docDetails).map((detail) => {
                    return (
                      <option value={detail.field_name}>
                        {detail.field_name}
                      </option>
                    );
                  })}
                </NativeSelect>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div>
                <NativeSelect
                  defaultValue={props.viewOrder}
                  onChange={(e) => props.setOrder(e.target.value)}
                >
                  <option value={'asc'}>asc</option>
                  <option value={'desc'}>desc</option>
                </NativeSelect>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div>
                <NativeSelect
                  defaultValue={props.rowNum}
                  onChange={(e) =>
                    props.setEntriesPerPage(parseInt(e.target.value))
                  }
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </NativeSelect>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div>
                <NativeSelect
                  defaultValue={props.isRemovable}
                  onChange={(e) =>
                    props.setUpdateOnly('true' == e.target.value)
                  }
                  style={{ width: '100%' }}
                >
                  <option value={true}>Add/Remove</option>
                  <option value={false}>Update Only</option>
                </NativeSelect>
              </div>
            </Grid>
            <Grid item xs={12} style={{ marginTop: 20 }}>
              <div>
                <Typography>Status For Table [{props.viewTable}]</Typography>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div>
                <NativeSelect
                  defaultValue={props.locked}
                  onChange={(e) =>
                    props.setLockedValue('true' == e.target.value)
                  }
                  style={{ width: '100%' }}
                >
                  <option value={true}>Locked (No API Access)</option>
                  <option value={false}>Unlocked (API Access)</option>
                </NativeSelect>
              </div>
            </Grid>
          </Grid>
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
