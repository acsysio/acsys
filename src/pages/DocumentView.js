import {
  Hidden,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { FileCopyOutlined as CopyIcon } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import uniqid from 'uniqid';
import * as Acsys from '../utils/Acsys/Acsys';
import AutoGen from '../components/Controls/AutoGen';
import BooleanSelect from '../components/Controls/BooleanSelect';
import DateTimePicker from '../components/Controls/DateTimePicker';
import ImageReference from '../components/Controls/ImageReference';
import ImageURL from '../components/Controls/ImageURL';
import NumberEditor from '../components/Controls/NumberEditor';
import RichTextEditor from '../components/Controls/RichTextEditor';
import TextField from '../components/Controls/TextField';
import VideoReference from '../components/Controls/VideoReference';
import VideoURL from '../components/Controls/VideoURL';
import FieldDef from '../components/FieldControl/FieldDef';
import FieldControlDialog from '../components/Dialogs/FieldControlDialog';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import StorageDialog from '../components/Dialogs/StorageDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';
import DropDown from '../components/Controls/DropDown';

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

const DocumentView = (props) => {
  const [collection, setCollection] = useState('');
  const [documentDetails, setdocumentDetails] = useState([]);
  const [fileMode, setfileMode] = useState('');
  const [draft, setdraft] = useState(false);
  const [views, setviews] = useState([]);
  const [apiCall, setapiCall] = useState('');
  const [keys, setkeys] = useState([]);
  const [acsysView, setacsysView] = useState([]);
  const [routed, setrouted] = useState(false);
  const [position, setPosition] = useState(0);
  const [locked, setLocked] = useState(true);
  const [loading, setloading] = useState(false);
  const [deleting, setdeleting] = useState(false);
  const [deleteLoading, setdeleteLoading] = useState(false);
  const [setOpen, setsetOpen] = useState(false);
  const [saving, setsaving] = useState(false);
  const [fileSelect, setfileSelect] = useState(false);
  const [filterLoading, setfilterLoading] = useState(false);
  const [error, setError] = useState('');
  const [control, setcontrol] = useState('');

  const copy = () => {
    const el = document.createElement('textarea');
    el.value = apiCall;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const imageHandler = async () => {
    const quill = quillRef.getEditor();
    quillIndex = quill.getSelection().index;
    openSelector('quill', 'quill');
  };

  const handleClickOpen = () => {
    setsetOpen(true);
  };

  const handleClose = () => {
    setsetOpen(false);
  };

  const handleDeleteOpen = async () => {
    setdeleting(true);
  };

  const handleDeleteClose = () => {
    setdeleting(false);
    setdeleteLoading(false);
  };

  const openSelector = (mode, control) => {
    setfileMode(mode);
    setfileSelect(true);
    setcontrol(control);
  };

  const setQuillRef = (ref) => {
    quillRef = ref;
  };

  const setQuillIndex = (index) => {
    quillIndex = index;
  };

  const setQuillURL = (url) => {
    quillURL = url;
  };

  const setReference = async (name, reference) => {
    const field = control;
    const url = await Acsys.getStorageURL(reference);
    if (fileMode === 'quill') {
      quillURL = url;
    } else if (fileMode === 'ref') {
      fileDoc[field] = reference;
      fileRefs[field] = url;
    } else {
      fileDoc[field] = url;
      fileRefs[field] = url;
    }
    setfileSelect(false);
  };

  const removeFile = (control) => {
    setloading(true);
    tempDocument[control] = '';
    fileRefs[control] = '';
    fileDoc[control] = '';
    setloading(false);
  };

  const handleSelectClose = () => {
    setfileSelect(false);
  };

  const handleChange = (key, event) => {
    tempDocument[key] = event;
  };

  const getMaxPos = async (table, field) => {
    return new Promise(async (resolve, reject) => {
      const pos = await Acsys.getData(table, '', 1, [field], 'desc')
        .then((result) => {
          resolve(result[0][field]);
        })
        .catch(() => {
          resolve(0);
        });
    });
  };

  const increment = async (table, field, start, num) => {
    return new Promise(async (resolve, reject) => {
      await Acsys.increment(table, field, start, num)
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  };

  const saveDocument = async () => {
    setsaving(true);
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
      }
      const result = await Acsys.updateData(
        'acsys_' + collection,
        { ...tempDocument },
        keys
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
      }
      const result = await Acsys.insertData(
        'acsys_' + collection,
        { ...tempDocument },
        keys
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
    mount();
  };

  const publishDocument = async () => {
    setsaving(true);
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
      }
      if (draft) {
        for (var i = 0; i < tempDetails.length; i++) {
          const result = await Acsys.updateData(
            'acsys_document_details',
            { ...tempDetails[i] },
            [['acsys_id', '=', tempDetails[i].acsys_id]]
          );
        }
        const result = await Acsys.insertData(
          collection,
          { ...tempDocument },
          keys
        );
        await Acsys.deleteData('acsys_' + collection, keys)
          .then(() => {
            setdraft(false);
          })
          .catch((error) => {});
      } else {
        const result = await Acsys.updateData(
          collection,
          { ...tempDocument },
          keys
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
      }
      await Acsys.insertData(collection, {
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
    mount();
  };

  const saveSettings = async () => {
    setfilterLoading(true);

    for (var i = 0; i < tempDetails.length; i++) {
      tempDetails[i].view_order = i;
      if (tempDetails[i].data !== undefined) {
        if (tempDetails[i].data === true) {
          await Acsys.deleteData('acsys_details_dropdown', [
            ['acsys_id', '=', tempDetails[i].acsys_id],
            ['field_name', '=', tempDetails[i].field_name],
          ]);
        } else {
          await Acsys.getData('acsys_details_dropdown', [
            ['acsys_id', '=', tempDetails[i].acsys_id],
            ['field_name', '=', tempDetails[i].field_name],
          ])
            .then(async (result) => {
              const entry = {
                acsys_id: tempDetails[i].acsys_id,
                field_name: tempDetails[i].field_name,
                field: tempDetails[i].data,
              };
              if (result.length > 0) {
                await Acsys.updateData('acsys_details_dropdown', entry, [
                  ['acsys_id', '=', tempDetails[i].acsys_id],
                  ['field_name', '=', tempDetails[i].field_name],
                ]);
              } else {
                await Acsys.insertData('acsys_details_dropdown', entry);
              }
            })
            .catch(() => {});
        }
        delete tempDetails[i].data;
      }
      const result = await Acsys.updateData(
        'acsys_document_details',
        { ...tempDetails[i] },
        [['acsys_id', '=', tempDetails[i].acsys_id]]
      );
    }
    setfilterLoading(false);
    handleClose();
  };

  const saveView = async (value) => {
    setloading(true);

    var tempView = acsysView;

    if (value) {
      tempView['table_keys'] = JSON.stringify(props.location.state.table_keys);
    } else {
      tempView['table_keys'] = [];
    }

    for (var i = 0; i < tempDetails.length; i++) {
      const result = await Acsys.updateData('acsys_logical_content', tempView, [
        ['viewId', '=', props.location.state.viewId],
      ]);
    }
    setloading(false);
  };

  const deleteView = async () => {
    setdeleteLoading(true);
    let collection;
    if (draft) {
      collection = 'acsys_' + documentDetails[0].collection;
    } else {
      collection = documentDetails[0].collection;
    }
    await Acsys.deleteData(collection, keys)
      .then(() => {
        handleClose();
        setdeleteLoading(false);
        props.history.goBack();
      })
      .catch((error) => {
        handleClose();
        setError(error);
        setdeleteLoading(false);
      });
  };

  useEffect(async () => {
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
    try {
      props.setHeader('Content');
      let tempMode = mode;
      let routedLocal = routed;
      const acsysView = await Acsys.getData('acsys_logical_content', [
        ['viewId', '=', props.location.state.viewId],
      ]);
      if (acsysView[0].table_keys.length > 0) {
        routedLocal = true;
      }
      try {
        mode = props.location.state.mode;
        is_removable = props.location.state.is_removable;
        if (routedLocal) {
          table_keys = JSON.parse(props.location.state.table_keys);
        } else {
          table_keys = props.location.state.table_keys;
        }
      } catch (error) {
        mode = tempMode;
      }
      setloading(true);
      setrouted(routedLocal);
      setacsysView(acsysView[0]);
      tempDocument = [];
      fileRefs = [];
      mount();
    } catch (error) {}
  }, [props.location.state]);

  const mount = async () => {
    let documentDetails;
    try {
      documentDetails = await Acsys.getData('acsys_document_details', [
        ['content_id', '=', props.location.state.viewId],
      ]);
    } catch (error) {
      documentDetails = documentDetails;
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
        await Acsys.getData(table, keys)
          .then((result) => {
            pullView = result;
          })
          .catch(async () => {});
        if (pullView.length < 1) {
          await Acsys.getData('acsys_' + table, keys).then((result) => {
            pullView = result;
            draft = true;
          });
        }
        await Acsys.getData('acsys_open_tables', [['table_name', '=', table]])
          .then(async (result) => {
            if (result[0].table_name === table) {
              open = true;
            }
          })
          .catch(() => {});

        apiCall = await Acsys.getOpenUrl(table, keys);

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
            fileRefs[documentDetails[i].field_name] = await Acsys.getStorageURL(
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

        setviews(currentView);
      } else {
        draft = true;
      }
      setloading(false);
      setdraft(draft);
      setsaving(false);
      setdocumentDetails(documentDetails);
      setLocked(!open);
      setCollection(table);
      setapiCall(apiCall);
      setkeys(keys);
      setPosition(position);
    } catch (error) {
      setloading(false);
      console.log(error);
    }
  };

  const renderData = () => {
    if (mode === 'update') {
      return <div>{renderWithId()}</div>;
    } else {
      return <div>{renderNoId()}</div>;
    }
  };

  const renderWithId = () => {
    return (
      <div class="element-container">
        <Grid container spacing={3}>
          {Object.values(documentDetails).map((details, dindex) => {
            return Object.values(views).map((value, index) => {
              let currentKey = Object.keys(views)[index];
              if (initLoad) {
                handleChange(currentKey, value);
                if (documentDetails.length - 1 === dindex) {
                  initLoad = false;
                }
              }
              if (
                currentKey == details.field_name &&
                details.is_visible_on_page
              ) {
                const date = new Date(value);
                return renderComponent(details, currentKey, date);
              }
            });
          })}
        </Grid>
      </div>
    );
  };

  const renderNoId = () => {
    return (
      <div class="element-container">
        <Grid container spacing={3}>
          {Object.values(documentDetails).map((details, dindex) => {
            let currentKey = details.field_name;
            if (details.is_visible_on_page) {
              let date;
              if (initLoad) {
                if (
                  details.control == 'dateTimePicker' ||
                  details.control == 'timePicker'
                ) {
                  date = new Date();
                  handleChange(currentKey, date);
                }
                if (documentDetails.length - 1 === dindex) {
                  initLoad = false;
                }
              } else {
                date = tempDocument[currentKey];
              }
              return renderComponent(details, currentKey, date);
            }
          })}
        </Grid>
      </div>
    );
  };

  const renderComponent = (details, currentKey, date) => {
    if (details.control == 'autoGen') {
      return (
        <AutoGen
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
        />
      );
    } else if (details.control == 'textEditor') {
      return (
        <TextField
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
        />
      );
    } else if (details.control == 'timePicker') {
      return (
        <DateTimePicker
          width={details.width}
          field_name={details.field_name}
          defaultValue={date}
          handleChange={handleChange}
          currentKey={currentKey}
          dateFormat={false}
        />
      );
    } else if (details.control == 'dateTimePicker') {
      return (
        <DateTimePicker
          width={details.width}
          field_name={details.field_name}
          defaultValue={date}
          handleChange={handleChange}
          currentKey={currentKey}
          dateFormat={true}
        />
      );
    } else if (details.control == 'dropDown') {
      return (
        <DropDown
          width={details.width}
          acsys_id={details.acsys_id}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
        />
      );
    } else if (details.control == 'numberEditor') {
      return (
        <NumberEditor
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
        />
      );
    } else if (details.control == 'richTextEditor') {
      return (
        <RichTextEditor
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
          imageHandler={imageHandler}
          setQuillRef={setQuillRef}
          setQuillIndex={setQuillIndex}
          setQuillURL={setQuillURL}
          index={quillIndex}
          quillRef={quillRef}
          url={quillURL}
        />
      );
    } else if (details.control == 'booleanSelect') {
      return (
        <BooleanSelect
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
        />
      );
    } else if (details.control == 'imageReference') {
      const url = fileRefs[details.field_name];
      return (
        <ImageReference
          width={details.width}
          field_name={details.field_name}
          url={url}
          openSelector={openSelector}
          removeFile={removeFile}
        />
      );
    } else if (details.control == 'imageURL') {
      const url = fileRefs[details.field_name];
      return (
        <ImageURL
          width={details.width}
          field_name={details.field_name}
          url={url}
          openSelector={openSelector}
          removeFile={removeFile}
        />
      );
    } else if (details.control == 'videoReference') {
      const url = fileRefs[details.field_name];
      return (
        <VideoReference
          width={details.width}
          field_name={details.field_name}
          url={url}
          openSelector={openSelector}
          removeFile={removeFile}
        />
      );
    } else if (details.control == 'videoURL') {
      const url = fileRefs[details.field_name];
      return (
        <VideoURL
          width={details.width}
          field_name={details.field_name}
          url={url}
          openSelector={openSelector}
          removeFile={removeFile}
        />
      );
    }
  };

  return (
    <div style={{ minHeight: 600 }}>
      {Acsys.getMode() !== 'Viewer' ? (
        <div>
          {!props.location.state.routed && is_removable ? (
            <Tooltip title="Delete Entry">
              <Button
                style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                variant="contained"
                color="primary"
                onClick={handleDeleteOpen}
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
              onClick={publishDocument}
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
                onClick={saveDocument}
              >
                Save Draft
              </Button>
            </Tooltip>
          ) : (
            <div></div>
          )}
          {Acsys.getMode() === 'Administrator' ? (
            <Tooltip title="Change How Data Is Presented">
              <Button
                style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                variant="contained"
                color="primary"
                onClick={handleClickOpen}
              >
                Field Controls
              </Button>
            </Tooltip>
          ) : (
            <div />
          )}
          {Acsys.getMode() === 'Administrator' ? (
            <Select
              defaultValue={props.location.state.routed}
              onChange={(e) => saveView(e.target.value)}
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
          {renderData()}
          <div class="element-container">
            <div style={{ height: 40 }}></div>
          </div>
        </div>
        <LoadingDialog loading={loading} message={'Loading'} />
        <LoadingDialog loading={saving} message={'Saving'} />
        <FieldControlDialog
          open={setOpen}
          closeDialog={handleClose}
          title={'Field Controls'}
          backend={HTML5Backend}
          component={
            <FieldDef docDetails={tempDetails} handleClick={saveSettings} />
          }
          action={saveSettings}
          actionProcess={filterLoading}
        />
        <StorageDialog
          open={fileSelect}
          closeDialog={handleSelectClose}
          fileMode={fileMode}
          docDetails={tempDetails}
          control={control}
          setReference={setReference}
        />
        <YesNoDialog
          open={deleting}
          closeDialog={handleDeleteClose}
          title={'Delete data?'}
          message={'Are you sure you want to delete this entry?'}
          action={deleteView}
          actionProcess={deleteLoading}
        />
      </Paper>
      <Hidden smDown implementation="css">
        {!locked ? (
          <div style={{ clear: 'both' }}>
            API Call:{' '}
            <a className="api-url" href={apiCall} target="_blank">
              {apiCall}
            </a>
            <Tooltip title="Copy To Clipboard">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="edit"
                onClick={copy}
                style={{ marginLeft: 5 }}
              >
                <CopyIcon style={{ height: 15 }} />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <div />
        )}
      </Hidden>
    </div>
  );
};
export default DocumentView;
