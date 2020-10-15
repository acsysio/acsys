import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Hidden,
  MenuItem,
  NativeSelect,
  Select,
  Tooltip,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import Datetime from 'react-datetime';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import ReactQuill from 'react-quill';
import uniqid from 'uniqid';
import * as Prom from '../../services/Prometheus/Prom';
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
  prmthsView: [],
  routed: false,
  position: 0,
  page: 0,
  rowsPerPage: 15,
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
let tableKeys = [];
let tempDetails = [];
let tempDocument = [];
let fileDoc = [];
let fileRefs = [];
let mode = '';
let isRemovable = true;
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
        const result = await Prom.updateData(
          'prmths_document_details',
          { ...tempDetails[i] },
          [['id', '=', tempDetails[i].id]]
        );
      }
      const result = await Prom.updateData(
        'prmths_' + this.state.collection,
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
        const result = await Prom.updateData(
          'prmths_document_details',
          { ...tempDetails[i] },
          [['id', '=', tempDetails[i].id]]
        );
      }

      const result = await Prom.insertData(
        'prmths_' + this.state.collection,
        { ...tempDocument },
        this.state.keys
      );
    }
    tableKeys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      if (tempDetails[i].isKey) {
        const object = {
          field: tempDetails[i].field_name,
          value: tempDocument[tempDetails[i].field_name],
        };
        tableKeys.push(object);
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
        if (tempDetails[i].control === 'position') {
          if (
            tempDocument[tempDetails[i].field_name] !==
            posArr[tempDetails[i].field_name]
          ) {
            if (tempDocument[tempDetails[i].field_name] === highestPos) {
              tempDocument[tempDetails[i].field_name] =
                (await this.getMaxPos(
                  tempDetails[i].collection,
                  tempDetails[i].field_name
                )) + 1;
            } else {
              let startAt = tempDocument[tempDetails[i].field_name];
              let end = posArr[tempDetails[i].field_name];
              if (startAt > initPos) {
                let stop = false;
                for (var k = 0; k < this.state.position.length; k++) {
                  if (
                    startAt ===
                      this.state.position[k][tempDetails[i].field_name] &&
                    !stop
                  ) {
                    stop = true;
                    var next = k + 1;
                    startAt = this.state.position[next][
                      tempDetails[i].field_name
                    ];
                    end++;

                    tempDocument[tempDetails[i].field_name] = startAt;
                    if (
                      !(await this.increment(
                        tempDetails[i].collection,
                        tempDetails[i].field_name,
                        startAt,
                        startAt
                      ))
                    ) {
                    }
                  }
                }
              } else {
                if (
                  !(await this.increment(
                    tempDetails[i].collection,
                    tempDetails[i].field_name,
                    startAt,
                    startAt
                  ))
                ) {
                  tempDocument[tempDetails[i].field_name] = end;
                }
              }
            }
            posArr[tempDetails[i].field_name] =
              tempDocument[tempDetails[i].field_name];
            initPos = tempDocument[tempDetails[i].field_name];
          }
        }
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
        const result = await Prom.updateData(
          'prmths_document_details',
          { ...tempDetails[i] },
          [['id', '=', tempDetails[i].id]]
        );
      }
      if (this.state.draft) {
        for (var i = 0; i < tempDetails.length; i++) {
          if (tempDetails[i].control === 'position') {
            tempDocument[tempDetails[i].field_name] =
              (await this.getMaxPos(
                tempDetails[i].collection,
                tempDetails[i].field_name
              )) + 1;
          }
          const result = await Prom.updateData(
            'prmths_document_details',
            { ...tempDetails[i] },
            [['id', '=', tempDetails[i].id]]
          );
        }
        const result = await Prom.insertData(
          this.state.collection,
          { ...tempDocument },
          this.state.keys
        );
        await Prom.deleteData(
          'prmths_' + this.state.collection,
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
          } else if (tempDetails[i].control === 'position') {
            tempDocument[tempDetails[i].field_name] =
              (await this.getMaxPos(
                tempDetails[i].collection,
                tempDetails[i].field_name
              )) + 1;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
        const result = await Prom.updateData(
          'prmths_document_details',
          { ...tempDetails[i] },
          [['id', '=', tempDetails[i].id]]
        );
      }
      const result = await Prom.insertData(this.state.collection, {
        ...tempDocument,
      });
    }
    tableKeys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      if (tempDetails[i].isKey) {
        const object = {
          field: tempDetails[i].field_name,
          value: tempDocument[tempDetails[i].field_name],
        };
        tableKeys.push(object);
      }
    }
    mode = 'update';
    this.mount();
    this.render();
  };

  saveSettings = async () => {
    this.setState({ filterLoading: true });

    for (var i = 0; i < tempDetails.length; i++) {
      tempDetails[i].viewOrder = i;
      const result = await Prom.updateData(
        'prmths_document_details',
        { ...tempDetails[i] },
        [['id', '=', tempDetails[i].id]]
      );
    }
    this.setState({ filterLoading: false });
    this.handleClose();
  };

  saveView = async (value) => {
    this.setState({ loading: true });

    var tempView = this.state.prmthsView;

    if (value) {
      tempView['tableKeys'] = this.props.location.state.tableKeys;
    } else {
      tempView['tableKeys'] = [];
    }

    for (var i = 0; i < tempDetails.length; i++) {
      const result = await Prom.updateData('prmths_logical_content', tempView, [
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
      collection = 'prmths_' + documentDetails[0].collection;
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
    try {
      this.props.setHeader('Content');
      initLoad = true;
      let tempMode = mode;
      let routed = this.state.routed;
      const prmthsView = await Prom.getData('prmths_logical_content', [
        ['viewId', '=', this.props.location.state.viewId],
      ]);
      try {
        mode = this.props.location.state.mode;
        isRemovable = this.props.location.state.isRemovable;
        tableKeys = this.props.location.state.tableKeys;
      } catch (error) {
        mode = tempMode;
      }
      if (prmthsView[0].tableKeys.length > 0) {
        routed = true;
      }
      this.setState({
        loading: true,
        routed: routed,
        prmthsView: prmthsView[0],
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
      documentDetails = await Prom.getData('prmths_document_details', [
        ['contentId', '=', this.props.location.state.viewId],
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
      documentDetails.sort((a, b) => (a.viewOrder > b.viewOrder ? 1 : -1));
      tempDetails = documentDetails;

      if (mode === 'update') {
        let pullView;

        for (let i = 0; i < tableKeys.length; i++) {
          keys.push([tableKeys[i].field, '=', tableKeys[i].value]);
        }

        await Prom.getData(table, keys)
          .then((result) => {
            pullView = result;
          })
          .catch(async () => {});
        if (pullView.length < 1) {
          await Prom.getData('prmths_' + table, keys).then((result) => {
            pullView = result;
            draft = true;
          });
        }
        await Prom.getData('prmths_open_tables', [['table_name', '=', table]])
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
          } else if (documentDetails[i].control === 'position') {
            position = await Prom.getData(
              table,
              '',
              '',
              [documentDetails[i].field_name],
              'asc'
            );
            highestPos =
              position[position.length - 1][documentDetails[i].field_name];
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
              if (currentKey == details.field_name && details.isVisibleOnPage) {
                if (details.control == 'autoGen') {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <input
                        placeholder="Enter value here"
                        defaultValue={tempDocument[currentKey]}
                        readOnly
                        type="text"
                        style={{ width: '100%' }}
                      />
                    </Grid>
                  );
                } else if (details.control == 'textEditor') {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <input
                        placeholder="Enter value here"
                        defaultValue={tempDocument[currentKey]}
                        onChange={(e) =>
                          this.handleChange(currentKey, e.target.value)
                        }
                        type="text"
                        style={{ width: '100%' }}
                      />
                    </Grid>
                  );
                } else if (details.control == 'dateTimePicker') {
                  let tempStr = value._seconds + '.' + value._nanoseconds;
                  const date = new Date(value);
                  return (
                    <Grid item xs={details.width}>
                      <Grid container spacing={0}>
                        <Grid item xs={4}>
                          <h3 class="element-header">
                            {details.field_name.toUpperCase()}
                          </h3>
                        </Grid>
                        <Grid item xs={12}>
                          <Datetime
                            margin="normal"
                            defaultValue={date}
                            onChange={(e) =>
                              this.handleChange(currentKey, e.toDate())
                            }
                            style={{ width: '100%' }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                } else if (details.control == 'numberEditor') {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <input
                        placeholder="Enter value here"
                        defaultValue={tempDocument[currentKey]}
                        onChange={(e) =>
                          this.handleChange(
                            currentKey,
                            parseInt(e.target.value)
                          )
                        }
                        type="number"
                        style={{ width: '100%' }}
                      />
                    </Grid>
                  );
                } else if (details.control == 'richTextEditor') {
                  const modules = {
                    toolbar: {
                      container: [
                        [{ font: [] }, { size: [] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ color: [] }, { background: [] }],
                        [{ script: 'super' }, { script: 'sub' }],
                        [
                          { header: '1' },
                          { header: '2' },
                          'blockquote',
                          'code-block',
                        ],
                        [
                          { list: 'ordered' },
                          { list: 'bullet' },
                          { indent: '-1' },
                          { indent: '+1' },
                        ],
                        ['direction', { align: [] }],
                        ['link', 'image', 'video', 'formula'],
                        ['clean'],
                      ],
                      handlers: {
                        image: this.imageHandler,
                      },
                    },
                    clipboard: {
                      matchVisual: false,
                    },
                  };
                  if (quillURL.length > 0) {
                    const quill = quillRef.getEditor();
                    quill.insertEmbed(quillIndex, 'image', quillURL);
                    quillURL = '';
                  }
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <div class="quill-container">
                        <ReactQuill
                          ref={(el) => {
                            quillRef = el;
                          }}
                          value={tempDocument[currentKey]}
                          modules={modules}
                          onChange={(e) => this.handleChange(currentKey, e)}
                          style={{
                            clear: 'both',
                            height: 400,
                            marginBottom: 40,
                          }}
                        />
                      </div>
                      <Hidden mdUp implementation="css">
                        <div style={{ height: 50 }} />
                      </Hidden>
                      <Hidden smUp implementation="css">
                        <div style={{ height: 20 }} />
                      </Hidden>
                    </Grid>
                  );
                } else if (details.control == 'booleanSelect') {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <NativeSelect
                        defaultValue={tempDocument[currentKey]}
                        onChange={(e) =>
                          this.handleChange(
                            currentKey,
                            'true' == e.target.value
                          )
                        }
                        inputProps={{
                          name: currentKey,
                        }}
                        style={{ width: '100%' }}
                      >
                        <option value={true}>True</option>
                        <option value={false}>False</option>
                      </NativeSelect>
                    </Grid>
                  );
                } else if (details.control == 'position') {
                  if (initLoad) {
                    initPos = tempDocument[currentKey];
                    posArr[details.field_name] = tempDocument[currentKey];
                  }
                  if (this.state.draft) {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <input
                          value="Auto generated on publish"
                          readonly
                          style={{ width: '100%' }}
                        />
                      </Grid>
                    );
                  } else {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <Select
                          defaultValue={tempDocument[currentKey]}
                          onChange={(e) =>
                            this.handleChange(
                              currentKey,
                              parseInt(e.target.value)
                            )
                          }
                          inputProps={{
                            name: currentKey,
                          }}
                          style={{ width: '100%', textAlign: 'left' }}
                        >
                          {Object.values(this.state.position).map(
                            (pos, index) => {
                              return (
                                <MenuItem value={pos[details.field_name]}>
                                  {index + 1}
                                </MenuItem>
                              );
                            }
                          )}
                        </Select>
                      </Grid>
                    );
                  }
                } else if (details.control == 'imageReference') {
                  const url = fileRefs[details.field_name];
                  if (url === undefined || url === '') {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <Button
                          style={{ width: '100%' }}
                          variant="contained"
                          color="primary"
                          onClick={(e) =>
                            this.openSelector('ref', details.field_name)
                          }
                        >
                          Select File
                        </Button>
                      </Grid>
                    );
                  } else {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <div class="image-container">
                          <img
                            src={url}
                            style={{ maxHeight: 500, maxWidth: '100%' }}
                          />
                        </div>
                        <div>
                          <Button
                            variant="contained"
                            color="primary"
                            style={{ minWidth: 100, marginRight: 20 }}
                            onClick={(e) =>
                              this.openSelector('ref', details.field_name)
                            }
                          >
                            Select
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            style={{ minWidth: 100, marginLeft: 20 }}
                            onClick={(e) => this.removeFile(details.field_name)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Grid>
                    );
                  }
                } else if (details.control == 'imageURL') {
                  const url = fileRefs[details.field_name];
                  if (url === undefined || url === '') {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <Button
                          style={{ width: '100%' }}
                          variant="contained"
                          color="primary"
                          onClick={(e) =>
                            this.openSelector('url', details.field_name)
                          }
                        >
                          Select File
                        </Button>
                      </Grid>
                    );
                  } else {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <div class="image-container">
                          <img
                            src={url}
                            style={{ maxHeight: 500, maxWidth: '100%' }}
                          />
                        </div>
                        <div>
                          <Button
                            variant="contained"
                            color="primary"
                            style={{ minWidth: 100, marginRight: 20 }}
                            onClick={(e) =>
                              this.openSelector('url', details.field_name)
                            }
                          >
                            Select
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            style={{ minWidth: 100, marginLeft: 20 }}
                            onClick={(e) => this.removeFile(details.field_name)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Grid>
                    );
                  }
                } else if (details.control == 'videoReference') {
                  const url = fileRefs[details.field_name];
                  if (url === undefined || url === '') {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <Button
                          style={{ width: '100%' }}
                          variant="contained"
                          color="primary"
                          onClick={(e) =>
                            this.openSelector('ref', details.field_name)
                          }
                        >
                          Select File
                        </Button>
                      </Grid>
                    );
                  } else {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <video
                          style={{ width: '100%', marginBottom: 15 }}
                          id="background-video"
                          loop
                          autoPlay
                        >
                          <source src={url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div>
                          <Button
                            variant="contained"
                            color="primary"
                            style={{ minWidth: 100, marginRight: 20 }}
                            onClick={(e) =>
                              this.openSelector('ref', details.field_name)
                            }
                          >
                            Select
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            style={{ minWidth: 100, marginLeft: 20 }}
                            onClick={(e) => this.removeFile(details.field_name)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Grid>
                    );
                  }
                } else if (details.control == 'videoURL') {
                  const url = fileRefs[details.field_name];
                  if (url === undefined || url === '') {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <Button
                          style={{ width: '100%' }}
                          variant="contained"
                          color="primary"
                          onClick={(e) =>
                            this.openSelector('url', details.field_name)
                          }
                        >
                          Select File
                        </Button>
                      </Grid>
                    );
                  } else {
                    return (
                      <Grid item xs={details.width}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                        <video
                          style={{ width: '100%', marginBottom: 15 }}
                          id="background-video"
                          loop
                          autoPlay
                        >
                          <source src={url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div>
                          <Button
                            variant="contained"
                            color="primary"
                            style={{ minWidth: 100, marginRight: 20 }}
                            onClick={(e) =>
                              this.openSelector('url', details.field_name)
                            }
                          >
                            Select
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            style={{ minWidth: 100, marginLeft: 20 }}
                            onClick={(e) => this.removeFile(details.field_name)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Grid>
                    );
                  }
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
            if (details.isVisibleOnPage) {
              if (details.control == 'autoGen') {
                return (
                  <Grid item xs={details.width}>
                    <h3 class="element-header">
                      {details.field_name.toUpperCase()}
                    </h3>
                    <input
                      placeholder="Value is autogenerated"
                      value="Value is autogenerated"
                      readonly
                      type="text"
                      style={{ width: '100%' }}
                    />
                  </Grid>
                );
              }
              if (details.control == 'booleanSelect') {
                return (
                  <Grid item xs={details.width}>
                    <h3 class="element-header">
                      {details.field_name.toUpperCase()}
                    </h3>
                    <NativeSelect
                      defaultValue={false}
                      onChange={(e) =>
                        this.handleChange(currentKey, 'true' == e.target.value)
                      }
                      inputProps={{
                        name: currentKey,
                      }}
                      style={{ width: '100%' }}
                    >
                      <option value={true}>True</option>
                      <option value={false}>False</option>
                    </NativeSelect>
                  </Grid>
                );
              }
              if (details.control == 'dateTimePicker') {
                if (initLoad) {
                  this.handleChange(currentKey, new Date());
                  if (documentDetails.length - 1 === dindex) {
                    initLoad = false;
                  }
                }
                return (
                  <Grid item xs={details.width}>
                    <Grid container spacing={0}>
                      <Grid item xs={4}>
                        <h3 class="element-header">
                          {details.field_name.toUpperCase()}
                        </h3>
                      </Grid>
                      <Grid item xs={12}>
                        <Datetime
                          margin="normal"
                          defaultValue={new Date()}
                          onChange={(e) =>
                            this.handleChange(currentKey, e.toDate())
                          }
                          style={{ width: '100%' }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                );
              }
              if (details.control == 'textEditor') {
                return (
                  <Grid item xs={details.width}>
                    <h3 class="element-header">
                      {details.field_name.toUpperCase()}
                    </h3>
                    <input
                      placeholder="Enter value here"
                      onChange={(e) =>
                        this.handleChange(currentKey, e.target.value)
                      }
                      type="text"
                      style={{ width: '100%' }}
                    />
                  </Grid>
                );
              } else if (details.control == 'richTextEditor') {
                const modules = {
                  toolbar: {
                    container: [
                      [{ font: [] }, { size: [] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ color: [] }, { background: [] }],
                      [{ script: 'super' }, { script: 'sub' }],
                      [
                        { header: '1' },
                        { header: '2' },
                        'blockquote',
                        'code-block',
                      ],
                      [
                        { list: 'ordered' },
                        { list: 'bullet' },
                        { indent: '-1' },
                        { indent: '+1' },
                      ],
                      ['direction', { align: [] }],
                      ['link', 'image', 'video', 'formula'],
                      ['clean'],
                    ],
                    handlers: {
                      image: this.imageHandler,
                    },
                  },
                  clipboard: {
                    matchVisual: false,
                  },
                };
                if (quillURL.length > 0) {
                  const quill = quillRef.getEditor();
                  quill.insertEmbed(quillIndex, 'image', quillURL);
                  quillURL = '';
                }
                return (
                  <Grid item xs={details.width}>
                    <h3 class="element-header">
                      {details.field_name.toUpperCase()}
                    </h3>
                    <div class="quill-container">
                      <ReactQuill
                        ref={(el) => {
                          quillRef = el;
                        }}
                        modules={modules}
                        onChange={(e) => this.handleChange(currentKey, e)}
                        style={{ clear: 'both', height: 400, marginBottom: 40 }}
                      />
                    </div>
                    <Hidden mdUp implementation="css">
                      <div style={{ height: 50 }} />
                    </Hidden>
                    <Hidden smUp implementation="css">
                      <div style={{ height: 20 }} />
                    </Hidden>
                  </Grid>
                );
              } else if (details.control == 'numberEditor') {
                return (
                  <Grid item xs={details.width}>
                    <h3 class="element-header">
                      {details.field_name.toUpperCase()}
                    </h3>
                    <input
                      placeholder="Enter value here"
                      onChange={(e) =>
                        this.handleChange(currentKey, parseInt(e.target.value))
                      }
                      type="number"
                      style={{ width: '100%' }}
                    />
                  </Grid>
                );
              } else if (details.control == 'position') {
                return (
                  <Grid item xs={details.width}>
                    <h3 class="element-header">
                      {details.field_name.toUpperCase()}
                    </h3>
                    <input
                      value="Auto generated on publish"
                      readonly
                      style={{ width: '100%' }}
                    />
                  </Grid>
                );
              } else if (details.control == 'imageReference') {
                const url = fileRefs[details.field_name];
                if (url === undefined || url === '') {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <Button
                        style={{ width: '100%' }}
                        variant="contained"
                        color="primary"
                        onClick={(e) =>
                          this.openSelector('ref', details.field_name)
                        }
                      >
                        Select File
                      </Button>
                    </Grid>
                  );
                } else {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <div class="image-container">
                        <img
                          src={url}
                          style={{ maxHeight: 500, maxWidth: '100%' }}
                        />
                      </div>
                      <div>
                        <Button
                          variant="contained"
                          color="primary"
                          style={{ minWidth: 100, marginRight: 20 }}
                          onClick={(e) =>
                            this.openSelector('ref', details.field_name)
                          }
                        >
                          Select
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          style={{ minWidth: 100, marginLeft: 20 }}
                          onClick={(e) => this.removeFile(details.field_name)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Grid>
                  );
                }
              } else if (details.control == 'imageURL') {
                const url = fileRefs[details.field_name];
                if (url === undefined || url === '') {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <Button
                        style={{ width: '100%' }}
                        variant="contained"
                        color="primary"
                        onClick={(e) =>
                          this.openSelector('url', details.field_name)
                        }
                      >
                        Select File
                      </Button>
                    </Grid>
                  );
                } else {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <div class="image-container">
                        <img
                          src={url}
                          style={{ maxHeight: 500, maxWidth: '100%' }}
                        />
                      </div>
                      <div>
                        <Button
                          variant="contained"
                          color="primary"
                          style={{ minWidth: 100, marginRight: 20 }}
                          onClick={(e) =>
                            this.openSelector('url', details.field_name)
                          }
                        >
                          Select
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          style={{ minWidth: 100, marginLeft: 20 }}
                          onClick={(e) => this.removeFile(details.field_name)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Grid>
                  );
                }
              } else if (details.control == 'videoReference') {
                const url = fileRefs[details.field_name];
                if (url === undefined || url === '') {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <Button
                        style={{ width: '100%' }}
                        variant="contained"
                        color="primary"
                        onClick={(e) =>
                          this.openSelector('ref', details.field_name)
                        }
                      >
                        Select File
                      </Button>
                    </Grid>
                  );
                } else {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <video
                        style={{ width: '100%', marginBottom: 15 }}
                        id="background-video"
                        loop
                        autoPlay
                      >
                        <source src={url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div>
                        <Button
                          variant="contained"
                          color="primary"
                          style={{ minWidth: 100, marginRight: 20 }}
                          onClick={(e) =>
                            this.openSelector('ref', details.field_name)
                          }
                        >
                          Select
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          style={{ minWidth: 100, marginLeft: 20 }}
                          onClick={(e) => this.removeFile(details.field_name)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Grid>
                  );
                }
              } else if (details.control == 'videoURL') {
                const url = fileRefs[details.field_name];
                if (url === undefined || url === '') {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <Button
                        style={{ width: '100%' }}
                        variant="contained"
                        color="primary"
                        onClick={(e) =>
                          this.openSelector('url', details.field_name)
                        }
                      >
                        Select File
                      </Button>
                    </Grid>
                  );
                } else {
                  return (
                    <Grid item xs={details.width}>
                      <h3 class="element-header">
                        {details.field_name.toUpperCase()}
                      </h3>
                      <video
                        style={{ width: '100%', marginBottom: 15 }}
                        id="background-video"
                        loop
                        autoPlay
                      >
                        <source src={url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div>
                        <Button
                          variant="contained"
                          color="primary"
                          style={{ minWidth: 100, marginRight: 20 }}
                          onClick={(e) =>
                            this.openSelector('url', details.field_name)
                          }
                        >
                          Select
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          style={{ minWidth: 100, marginLeft: 20 }}
                          onClick={(e) => this.removeFile(details.field_name)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Grid>
                  );
                }
              } else {
                return (
                  <Grid item xs={details.width}>
                    <h3 class="element-header">
                      {details.field_name.toUpperCase()}
                    </h3>
                    <input
                      placeholder="Enter value here"
                      onChange={(e) =>
                        this.handleChange(currentKey, e.target.value)
                      }
                      type="text"
                      style={{ width: '100%' }}
                    />
                  </Grid>
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
            {!this.props.location.state.routed && isRemovable ? (
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
        <div style={{clear: 'both'}}>API Call: {apiCall}</div>
      </div>
    );
  }
}
const condition = (authUser) => authUser != null;
export default DocumentView;
