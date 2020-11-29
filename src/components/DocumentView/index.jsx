import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Hidden,
  IconButton,
  MenuItem,
  Select,
  Tooltip
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {
  FileCopyOutlined as CopyIcon
} from '@material-ui/icons';
import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import uniqid from 'uniqid';
import * as Prom from '../../services/Acsys/Acsys';
import AutoGen from '../Controls/AutoGen';
import BooleanSelect from '../Controls/BooleanSelect';
import DateTimePicker from '../Controls/DateTimePicker';
import ImageReference from '../Controls/ImageReference';
import ImageURL from '../Controls/ImageURL';
import NumberEditor from '../Controls/NumberEditor';
import RichTextEditor from '../Controls/RichTextEditor';
import TextField from '../Controls/TextField';
import VideoReference from '../Controls/VideoReference';
import VideoURL from '../Controls/VideoURL';
import Example from '../FieldControl/FieldDef';
import Storage from '../Storage';

const INITIAL_STATE = {
  viewId: 0,
  initialViews: [],
  collection: '',
  documentDetails: [],
  currentKey: '',
  fileMode: '',
  draft: false,
  document: [],
  views: [],
  apiCall: '',
  keys: [],
  acsysView: [],
  routed: false,
  position: 0,
  page: 0,
  rowsPerPage: 15,
  locked: true,
  loading: false,
  deleting: false,
  deleteLoading: false,
  setOpen: false,
  saving: false,
  fileSelect: false,
  filterLoading: false,
  error: '',
};

let initLoad = true;
let table_keys = [];
let tempDetails = [];
let tempDocument = [];
let fileDoc = [];
let fileRefs = [];
let mode = '';
let is_removable = true;
let quillRef = null;
let quillIndex = 0;
let quillURL = '';
let posArr = [];
let initPos = 0;
let highestPos = 0;

class DocumentView extends React.Component {
  state = { ...INITIAL_STATE };

  constructor(props) {
    super(props);
  }

  copy = () => {
    const el = document.createElement('textarea');
    el.value = this.state.apiCall;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  imageHandler = async () => {
    const quill = quillRef.getEditor();
    quillIndex = quill.getSelection().index;
    this.openSelector('quill', 'quill');
  };

  handleClickOpen = () => {
    this.setState({
      setOpen: true,
    });
  };

  handleClose = () => {
    this.setState({
      setOpen: false,
    });
  };

  handleDeleteOpen = async () => {
    this.setState({
      deleting: true,
    });
  };

  handleDeleteClose = () => {
    this.setState({
      deleting: false,
      deleteLoading: false,
    });
  };

  openSelector = (mode, control) => {
    this.setState({
      fileMode: mode,
      fileSelect: true,
      control: control,
    });
  };

  setQuillRef = (ref) => {
    quillRef = ref;
  };

  setQuillIndex = (index) => {
    quillIndex = index;
  };

  setQuillURL = (url) => {
    quillURL = url;
  };

  setReference = async (name, reference) => {
    const field = this.state.control;
    const url = await Prom.getStorageURL(reference);
    if (this.state.fileMode === 'quill') {
      quillURL = url;
    } else if (this.state.fileMode === 'ref') {
      fileDoc[field] = reference;
      fileRefs[field] = url;
    } else {
      fileDoc[field] = url;
      fileRefs[field] = url;
    }
    this.setState({
      fileSelect: false,
    });
  };

  removeFile = (control) => {
    this.setState({
      loading: true,
    });
    tempDocument[control] = '';
    fileRefs[control] = '';
    fileDoc[control] = '';
    this.setState({
      loading: false,
    });
  };

  handleSelectClose = () => {
    this.setState({
      fileSelect: false,
    });
  };

  handleChange = (key, event) => {
    tempDocument[key] = event;
  };

  getMaxPos = async (table, field) => {
    return new Promise(async (resolve, reject) => {
      const pos = await Prom.getData(table, '', 1, [field], 'desc')
        .then((result) => {
          resolve(result[0][field]);
        })
        .catch(() => {
          resolve(0);
        });
    });
  };

  increment = async (table, field, start, num) => {
    return new Promise(async (resolve, reject) => {
      await Prom.increment(table, field, start, num)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  };

  saveDocument = async () => {
    this.setState({ saving: true });
    if (mode === 'update') {
      for (var i = 0; i < tempDetails.length; i++) {
        if (fileDoc[tempDetails[i].field_name] !== undefined) {
          tempDocument[tempDetails[i].field_name] =
            fileDoc[tempDetails[i].field_name];
        } else if (tempDocument[tempDetails[i].field_name] === undefined) {
          if (tempDetails[i].control === 'numberEditor') {
            tempDocument[tempDetails[i].field_name] = 0;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
        // const result = await Prom.updateData(
        //   'acsys_document_details',
        //   { ...tempDetails[i] },
        //   [['acsys_id', '=', tempDetails[i].acsys_id]]
        // );
      }
      const result = await Prom.updateData(
        'acsys_' + this.state.collection,
        { ...tempDocument },
        this.state.keys
      );
    } else {
      for (var i = 0; i < tempDetails.length; i++) {
        if (tempDetails[i].control === 'autoGen') {
          tempDocument[tempDetails[i].field_name] = uniqid();
        } else if (fileDoc[tempDetails[i].field_name] !== undefined) {
          tempDocument[tempDetails[i].field_name] =
            fileDoc[tempDetails[i].field_name];
        } else if (tempDocument[tempDetails[i].field_name] === undefined) {
          if (tempDetails[i].control === 'numberEditor') {
            tempDocument[tempDetails[i].field_name] = 0;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
        // const result = await Prom.updateData(
        //   'acsys_document_details',
        //   { ...tempDetails[i] },
        //   [['acsys_id', '=', tempDetails[i].acsys_id]]
        // );
      }
      const result = await Prom.insertData(
        'acsys_' + this.state.collection,
        { ...tempDocument },
        this.state.keys
      );
    }
    table_keys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      if (tempDetails[i].is_key) {
        const object = {
          field: tempDetails[i].field_name,
          value: tempDocument[tempDetails[i].field_name],
        };
        table_keys.push(object);
      }
    }
    mode = 'update';
    this.mount();
    this.render();
  };

  publishDocument = async () => {
    this.setState({ saving: true });
    if (mode === 'update') {
      for (var i = 0; i < tempDetails.length; i++) {
        if (fileDoc[tempDetails[i].field_name] !== undefined) {
          tempDocument[tempDetails[i].field_name] =
            fileDoc[tempDetails[i].field_name];
        } else if (tempDocument[tempDetails[i].field_name] === undefined) {
          if (tempDetails[i].control === 'numberEditor') {
            tempDocument[tempDetails[i].field_name] = 0;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
        // const result = await Prom.updateData(
        //   'acsys_document_details',
        //   { ...tempDetails[i] },
        //   [['acsys_id', '=', tempDetails[i].acsys_id]]
        // );
      }
      if (this.state.draft) {
        for (var i = 0; i < tempDetails.length; i++) {
          const result = await Prom.updateData(
            'acsys_document_details',
            { ...tempDetails[i] },
            [['acsys_id', '=', tempDetails[i].acsys_id]]
          );
        }
        const result = await Prom.insertData(
          this.state.collection,
          { ...tempDocument },
          this.state.keys
        );
        await Prom.deleteData(
          'acsys_' + this.state.collection,
          this.state.keys
        )
          .then(() => {
            this.setState({ draft: false });
          })
          .catch((error) => {});
      } else {
        const result = await Prom.updateData(
          this.state.collection,
          { ...tempDocument },
          this.state.keys
        );
      }
    } else {
      for (var i = 0; i < tempDetails.length; i++) {
        if (tempDetails[i].control === 'autoGen') {
          tempDocument[tempDetails[i].field_name] = uniqid();
        } else if (fileDoc[tempDetails[i].field_name] !== undefined) {
          tempDocument[tempDetails[i].field_name] =
            fileDoc[tempDetails[i].field_name];
        } else if (tempDocument[tempDetails[i].field_name] === undefined) {
          if (tempDetails[i].control === 'numberEditor') {
            tempDocument[tempDetails[i].field_name] = 0;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
        // await Prom.updateData(
        //   'acsys_document_details',
        //   { ...tempDetails[i] },
        //   [['acsys_id', '=', tempDetails[i].acsys_id]]
        // );
      }
      console.log(fileDoc)
      await Prom.insertData(this.state.collection, {
        ...tempDocument,
      });
    }
    table_keys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      if (tempDetails[i].is_key) {
        const object = {
          field: tempDetails[i].field_name,
          value: tempDocument[tempDetails[i].field_name],
        };
        table_keys.push(object);
      }
    }
    mode = 'update';
    this.mount();
    this.render();
  };

  saveSettings = async () => {
    this.setState({ filterLoading: true });

    for (var i = 0; i < tempDetails.length; i++) {
      tempDetails[i].view_order = i;
      const result = await Prom.updateData(
        'acsys_document_details',
        { ...tempDetails[i] },
        [['acsys_id', '=', tempDetails[i].acsys_id]]
      );
    }
    this.setState({ filterLoading: false });
    this.handleClose();
  };

  saveView = async (value) => {
    this.setState({ loading: true });

    var tempView = this.state.acsysView;

    if (value) {
      tempView['table_keys'] = JSON.stringify(this.props.location.state.table_keys);
    } else {
      tempView['table_keys'] = [];
    }

    for (var i = 0; i < tempDetails.length; i++) {
      const result = await Prom.updateData('acsys_logical_content', tempView, [
        ['viewId', '=', this.props.location.state.viewId],
      ]);
    }
    this.setState({ loading: false });
  };

  deleteView = async () => {
    const { draft, documentDetails } = this.state;
    this.setState({ deleteLoading: true });
    let collection;
    if (draft) {
      collection = 'acsys_' + documentDetails[0].collection;
    } else {
      collection = documentDetails[0].collection;
    }
    await Prom.deleteData(collection, this.state.keys)
      .then(() => {
        this.handleClose();
        this.setState({ deleteLoading: false });
        this.props.history.goBack();
      })
      .catch((error) => {
        this.handleClose();
        this.setState({ error, deleteLoading: false });
      });
  };

  componentDidMount = async () => {
    initLoad = true;
    table_keys = [];
    tempDetails = [];
    tempDocument = [];
    fileDoc = [];
    fileRefs = [];
    mode = '';
    is_removable = true;
    quillRef = null;
    quillIndex = 0;
    quillURL = '';
    posArr = [];
    initPos = 0;
    highestPos = 0;
    try {
      this.props.setHeader('Content');
      let tempMode = mode;
      let routed = this.state.routed;
      const acsysView = await Prom.getData('acsys_logical_content', [
        ['viewId', '=', this.props.location.state.viewId],
      ]);
      if (acsysView[0].table_keys.length > 0) {
        routed = true;
      }
      try {
        mode = this.props.location.state.mode;
        is_removable = this.props.location.state.is_removable;
        if(routed) {
          table_keys = JSON.parse(this.props.location.state.table_keys);
        }
        else {
          table_keys = this.props.location.state.table_keys;
        }
      } catch (error) {
        mode = tempMode;
      }
      this.setState({
        loading: true,
        routed: routed,
        acsysView: acsysView[0],
      });
      tempDocument = [];
      fileRefs = [];
      highestPos = 0;
      this.mount();
    }
    catch (error) {

    }
  };

  mount = async () => {
    let documentDetails;
    try {
      documentDetails = await Prom.getData('acsys_document_details', [
        ['content_id', '=', this.props.location.state.viewId],
      ]);
    } catch (error) {
      documentDetails = this.state.documentDetails;
    }
    let table = documentDetails[0].collection;
    let draft = false;
    let keys = [];
    let apiCall;
    let position = 0;
    let open = false;
    try {
      documentDetails.sort((a, b) => (a.view_order > b.view_order ? 1 : -1));
      tempDetails = documentDetails;

      if (mode === 'update') {
        let pullView;

        for (let i = 0; i < table_keys.length; i++) {
          keys.push([table_keys[i].field, '=', table_keys[i].value]);
        }
        await Prom.getData(table, keys)
          .then((result) => {
            pullView = result;
          })
          .catch(async () => {});
        if (pullView.length < 1) {
          await Prom.getData('acsys_' + table, keys).then((result) => {
            pullView = result;
            draft = true;
          });
        }
        await Prom.getData('acsys_open_tables', [['table_name', '=', table]])
        .then(async (result) => {
          if (result[0].table_name === table) {
            open = true;
          }
        })
        .catch(() => {});

        if (open) {
          apiCall = await Prom.getOpenUrl(table, keys);
        }
        else {
          apiCall = await Prom.getUrl(table, keys);
        }

        let currentView;

        if (pullView[0] === undefined) {
          currentView = pullView;
        } else {
          currentView = pullView[0];
        }

        for (let i = 0; i < documentDetails.length; i++) {
          if (
            documentDetails[i].control === 'imageReference' ||
            documentDetails[i].control === 'videoReference'
          ) {
            fileRefs[documentDetails[i].field_name] = await Prom.getStorageURL(
              currentView[documentDetails[i].field_name]
            );
            fileDoc[documentDetails[i].field_name] =
              currentView[documentDetails[i].field_name];
          } else if (
            documentDetails[i].control === 'imageURL' ||
            documentDetails[i].control === 'videoURL'
          ) {
            fileRefs[documentDetails[i].field_name] =
              currentView[documentDetails[i].field_name];
            fileDoc[documentDetails[i].field_name] =
              currentView[documentDetails[i].field_name];
          }
        }

        this.setState({
          views: currentView,
        });
      } else {
        draft = true;
      }

      this.setState({
        loading: false,
        draft: draft,
        saving: false,
        documentDetails: documentDetails,
        locked: !open,
        collection: table,
        apiCall: apiCall,
        keys: keys,
        position: position,
      });
    } catch (error) {
      this.setState({
        loading: false,
      });
      console.log(error);
    }
  };

  renderData() {
    if (mode === 'update') {
      return <div>{this.renderWithId()}</div>;
    } else {
      return <div>{this.renderNoId()}</div>;
    }
  }

  renderWithId() {
    const { views, documentDetails, rowsPerPage, page } = this.state;
    return (
      <div class="element-container">
        <Grid container spacing={3}>
          {Object.values(documentDetails).map((details, dindex) => {
            return Object.values(views).map((value, index) => {
              let currentKey = Object.keys(views)[index];
              if (initLoad) {
                this.handleChange(currentKey, value);
                if (documentDetails.length - 1 === dindex) {
                  initLoad = false;
                }
              }
              if (currentKey == details.field_name && details.is_visible_on_page) {
                if (details.control == 'autoGen') {
                  return (
                    <AutoGen width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} />
                  );
                } else if (details.control == 'textEditor') {
                  return (
                    <TextField width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} handleChange = {this.handleChange} currentKey = {currentKey} />
                  );
                } else if (details.control == 'dateTimePicker') {
                  let tempStr = value._seconds + '.' + value._nanoseconds;
                  const date = new Date(value);
                  return (
                    <DateTimePicker width = {details.width} field_name = {details.field_name} defaultValue = {date} handleChange = {this.handleChange} currentKey = {currentKey} />
                  );
                } else if (details.control == 'numberEditor') {
                  return (
                    <NumberEditor width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} handleChange = {this.handleChange} currentKey = {currentKey} />
                  );
                } else if (details.control == 'richTextEditor') {
                  return (
                    <RichTextEditor width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} handleChange = {this.handleChange} currentKey = {currentKey} imageHandler = {this.imageHandler} setQuillRef = {this.setQuillRef} setQuillIndex = {this.setQuillIndex} setQuillURL = {this.setQuillURL} index = {quillIndex} quillRef = {quillRef} url = {quillURL} />
                  );
                } else if (details.control == 'booleanSelect') {
                  return (
                    <BooleanSelect width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} handleChange = {this.handleChange} currentKey = {currentKey} />
                  );
                } else if (details.control == 'imageReference') {
                  const url = fileRefs[details.field_name];
                  return (
                    <ImageReference width = {details.width} field_name = {details.field_name} url = {url} openSelector = {this.openSelector} removeFile = {this.removeFile} />
                  );
                } else if (details.control == 'imageURL') {
                  const url = fileRefs[details.field_name];
                  return (
                    <ImageURL width = {details.width} field_name = {details.field_name} url = {url} openSelector = {this.openSelector} removeFile = {this.removeFile} />
                  );
                } else if (details.control == 'videoReference') {
                  const url = fileRefs[details.field_name];
                  return (
                    <VideoReference width = {details.width} field_name = {details.field_name} url = {url} openSelector = {this.openSelector} removeFile = {this.removeFile} />
                  );
                } else if (details.control == 'videoURL') {
                  const url = fileRefs[details.field_name];
                  return (
                    <VideoURL width = {details.width} field_name = {details.field_name} url = {url} openSelector = {this.openSelector} removeFile = {this.removeFile} />
                  );
                }
              }
            });
          })}
        </Grid>
      </div>
    );
  }

  renderNoId() {
    const { documentDetails } = this.state;
    return (
      <div class="element-container">
        <Grid container spacing={3}>
          {Object.values(documentDetails).map((details, dindex) => {
            let currentKey = details.field_name;
            if (details.is_visible_on_page) {
              if (details.control == 'autoGen') {
                return (
                  <AutoGen width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} new = {true} />
                );
              } else if (details.control == 'textEditor') {
                return (
                  <TextField width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} handleChange = {this.handleChange} currentKey = {currentKey} />
                );
              } else if (details.control == 'dateTimePicker') {
                if (initLoad) {
                  this.handleChange(currentKey, new Date());
                  if (documentDetails.length - 1 === dindex) {
                    initLoad = false;
                  }
                }
                return (
                  <DateTimePicker width = {details.width} field_name = {details.field_name} defaultValue = {new Date} handleChange = {this.handleChange} currentKey = {currentKey} />
                );
              } else if (details.control == 'numberEditor') {
                return (
                  <NumberEditor width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} handleChange = {this.handleChange} currentKey = {currentKey} />
                );
              } else if (details.control == 'richTextEditor') {
                return (
                  <RichTextEditor width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} handleChange = {this.handleChange} currentKey = {currentKey} imageHandler = {this.imageHandler} setQuillRef = {this.setQuillRef} setQuillIndex = {this.setQuillIndex} setQuillURL = {this.setQuillURL} index = {quillIndex} quillRef = {quillRef} url = {quillURL} />
                );
              } else if (details.control == 'booleanSelect') {
                return (
                  <BooleanSelect width = {details.width} field_name = {details.field_name} defaultValue = {tempDocument[currentKey]} handleChange = {this.handleChange} currentKey = {currentKey} />
                );
              } else if (details.control == 'imageReference') {
                const url = fileRefs[details.field_name];
                return (
                  <ImageReference width = {details.width} field_name = {details.field_name} url = {url} openSelector = {this.openSelector} removeFile = {this.removeFile} />
                );
              } else if (details.control == 'imageURL') {
                const url = fileRefs[details.field_name];
                return (
                  <ImageURL width = {details.width} field_name = {details.field_name} url = {url} openSelector = {this.openSelector} removeFile = {this.removeFile} />
                );
              } else if (details.control == 'videoReference') {
                const url = fileRefs[details.field_name];
                return (
                  <VideoReference width = {details.width} field_name = {details.field_name} url = {url} openSelector = {this.openSelector} removeFile = {this.removeFile} />
                );
              } else if (details.control == 'videoURL') {
                const url = fileRefs[details.field_name];
                return (
                  <VideoURL width = {details.width} field_name = {details.field_name} url = {url} openSelector = {this.openSelector} removeFile = {this.removeFile} />
                );
              }
            }
          })}
        </Grid>
      </div>
    );
  }

  render() {
    const { filterLoading, draft, deleteLoading, apiCall } = this.state;
    return (
      <div style={{ minHeight: 600 }}>
        {Prom.getMode() !== 'Viewer' ? (
          <div>
            {!this.props.location.state.routed && is_removable ? (
              <Tooltip title="Delete Entry">
                <Button
                  style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                  variant="contained"
                  color="primary"
                  onClick={this.handleDeleteOpen}
                >
                  Delete
                </Button>
              </Tooltip>
            ) : (
              <div />
            )}
            <Tooltip title="Publish Entry">
              <Button
                style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                variant="contained"
                color="primary"
                onClick={this.publishDocument}
              >
                Publish
              </Button>
            </Tooltip>
            {draft ? (
              <Tooltip title="Save Entry As Draft">
                <Button
                  style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                  variant="contained"
                  color="primary"
                  onClick={this.saveDocument}
                >
                  Save Draft
                </Button>
              </Tooltip>
            ) : (
              <div></div>
            )}
            {Prom.getMode() === 'Administrator' ? (
              <Tooltip title="Change How Data Is Presented">
                <Button
                  style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                  variant="contained"
                  color="primary"
                  onClick={this.handleClickOpen}
                >
                  Field Controls
                </Button>
              </Tooltip>
            ) : (
              <div />
            )}
            {Prom.getMode() === 'Administrator' ? (
              <Select
                defaultValue={this.props.location.state.routed}
                onChange={(e) => this.saveView(e.target.value)}
                style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
              >
                <MenuItem value={false}>Accessed From Table</MenuItem>
                <MenuItem value={true}>Accessed From View</MenuItem>
              </Select>
            ) : (
              <div />
            )}
          </div>
        ) : (
          <div />
        )}
        <Paper style={{ margin: 'auto', clear: 'both' }}>
          <div>
            {this.renderData()}
            <div class="element-container">
              <div style={{ height: 40 }}></div>
            </div>
          </div>
          <Dialog
            open={this.state.loading}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'md'}
          >
            <DialogTitle id="alert-dialog-title" style={{ margin: 'auto' }}>
              Loading
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
          <Dialog
            open={this.state.setOpen}
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'lg'}
          >
            <DialogTitle id="alert-dialog-title">Field Controls</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description"></DialogContentText>
              <div>
                <DndProvider backend={Backend}>
                  <Example
                    docDetails={tempDetails}
                    handleClick={this.saveSettings}
                  />
                </DndProvider>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.saveSettings}
                color="primary"
                autoFocus
              >
                {filterLoading && <CircularProgress size={24} />}
                {!filterLoading && 'Save'}
              </Button>
              <Button
                onClick={this.handleClose}
                color="primary"
                autoFocus
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.saving}
            onClose={this.handleSaveClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'md'}
          >
            <DialogTitle id="alert-dialog-title" style={{ margin: 'auto' }}>
              Saving
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
          <Dialog
            open={this.state.fileSelect}
            onClose={this.handleSelectClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'md'}
            fullWidth={true}
          >
            <Storage
              mode={this.state.fileMode}
              doc={tempDocument}
              control={this.state.control}
              setFile={this.setReference}
            />
          </Dialog>
          <Dialog
            open={this.state.deleting}
            onClose={this.handleDeleteClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{'Delete data?'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this entry?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDeleteClose} color="primary">
                No
              </Button>
              <Button
                onClick={this.deleteView}
                color="primary"
                disabled={deleteLoading}
                autoFocus
              >
                {deleteLoading && <CircularProgress size={24} />}
                {!deleteLoading && 'Yes'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
        <Hidden smDown implementation="css">
          {!this.state.locked ?
          <div style={{clear: 'both'}}>
            API Call: <a className='api-url' href={apiCall} target="_blank">{apiCall}</a>
            <Tooltip title="Copy To Clipboard">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="edit"
                onClick={this.copy}
                style={{ marginLeft: 5 }}
              >
                <CopyIcon style={{ height: 15 }}/>
              </IconButton>
            </Tooltip>
          </div>
          :
          <div/>
          }
        </Hidden>
      </div>
    );
  }
}
export default DocumentView;
