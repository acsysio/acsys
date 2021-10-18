/* eslint-disable react/jsx-boolean-value */
import {
  AppBar,
  Grid,
  NativeSelect,
  Paper,
  Typography,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import AddButton from '@material-ui/icons/AddCircle';
import RemoveButton from '@material-ui/icons/RemoveCircle';
import React, { memo, useMemo, useEffect, useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import ItemTypes from './ItemTypes';

const style = {
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'grab',
};

export default function EditText(props) {
  const [isDropdown, setDropdown] = useState(false);
  const [dropDownFields, setDropDownFields] = useState([]);
  const ref = useRef(null);
  useEffect(() => {
    if (props.data !== undefined && dropDownFields.length === 0) {
      setDropDownFields(props.data);
    }
  });
  useEffect(() => {
    if (props.details.control === 'dropDown') {
      setDropdown(true);
    }
  }, []);
  const [{ isDragging }, connectDrag] = useDrag({
    item: { id: props.id, type: ItemTypes.CARD },
    collect: (monitor) => {
      const result = {
        isDragging: monitor.isDragging(),
      };
      return result;
    },
  });
  const [, connectDrop] = useDrop({
    accept: ItemTypes.CARD,
    hover({ id: draggedId }) {
      if (draggedId !== props.id) {
        props.moveCard(draggedId, props.id);
      }
    },
  });
  connectDrag(ref);
  connectDrop(ref);
  const opacity = isDragging ? 0 : 1;
  const containerStyle = useMemo(() => ({ ...style, opacity }), [opacity]);
  const data = [];

  data.push(<option value="none">none</option>);

  if (props.details.type === 'string') {
    data.push(<option value="autoGen">autoGen</option>);
    data.push(<option value="textEditor">textEditor</option>);
    data.push(<option value="richTextEditor">richTextEditor</option>);
    data.push(<option value="timePicker">timePicker</option>);
    data.push(<option value="dateTimePicker">dateTimePicker</option>);
    data.push(<option value="dayPicker">dayPicker</option>);
    data.push(<option value="dropDown">dropDown</option>);
    data.push(<option value="imageReference">imageReference</option>);
    data.push(<option value="imageURL">imageURL</option>);
    data.push(<option value="videoReference">videoReference</option>);
    data.push(<option value="videoURL">videoURL</option>);
  }

  if (props.details.type === 'boolean') {
    data.push(<option value="booleanSelect">boolean</option>);
  }

  if (props.details.type === 'number') {
    data.push(<option value="numberEditor">numberEditor</option>);
    data.push(<option value="booleanSelect">boolean</option>);
  }

  const width = [];

  for (let i = 0; i < 12; i++) {
    width.push(<option value={i + 1}>{i + 1}</option>);
  }

  const setControl = (event) => {
    if (event === 'dropDown') {
      setDropdown(true);
    } else {
      if (props.data !== undefined) {
        props.details['data'] = true;
      }
      setDropdown(false);
    }
    props.details.control = event;
  };
  const setField = (index, event) => {
    let tempArr = [...dropDownFields];
    tempArr[index] = event;
    props.details['data'] = tempArr.toString();
    setDropDownFields(tempArr);
  };
  const setKey = (event) => {
    props.details.is_key = event;
  };
  const showOnTable = (event) => {
    props.details.is_visible_on_table = event;
  };
  const showOnPage = (event) => {
    props.details.is_visible_on_page = event;
  };
  const setWidth = (event) => {
    props.details.width = parseInt(event);
  };

  const addField = () => {
    let tempArr = [...dropDownFields];
    tempArr.push('');
    setDropDownFields(tempArr);
  };

  const removeField = (index) => {
    if (dropDownFields.length > 1 || dropDownFields.length < 11) {
      let tempArr = [...dropDownFields];
      tempArr.splice(index, 1);
      props.details['data'] = tempArr.toString();
      setDropDownFields(tempArr);
    }
  };

  const getField = (index, value) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} />
        <Grid item xs={3}>
          <div>
            <Typography>Custom Field {index + 1}</Typography>
          </div>
        </Grid>
        <Grid item xs={8}>
          <div>
            <input
              placeholder="Enter Value"
              value={value}
              onChange={(e) => setField(index, e.target.value)}
              type="text"
              style={{ width: '95%' }}
            />
          </div>
        </Grid>
        <Grid item xs={1}>
          <IconButton
            edge="start"
            color="primary"
            aria-label="remove"
            style={{ padding: 0 }}
            onClick={() => removeField(index)}
          >
            <RemoveButton style={{ fontSize: 20 }} />
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  return (
    <Paper style={{ marginBottom: 30, paddingBottom: 10 }}>
      <AppBar
        style={{ height: 30, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
        position="static"
        color="default"
        elevation={0}
      >
        <Typography variant="subtitle1" align="center">
          {props.details.field_name}
        </Typography>
      </AppBar>
      <div ref={ref} style={containerStyle}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <div>
              <Typography>Control</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <Typography>Key</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <Typography>Show on table</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <Typography>Show on page</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <Typography>Width on page</Typography>
            </div>
          </Grid>
          <Grid item xs={3}>
            <div>
              <NativeSelect
                defaultValue={props.details.control}
                onChange={(e) => setControl(e.target.value)}
              >
                {data}
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={Boolean(props.details.is_key)}
                onChange={(e) => setKey(e.target.value == 'true')}
              >
                <option value={true}>True</option>
                <option value={false}>False</option>
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={Boolean(props.details.is_visible_on_table)}
                onChange={(e) => showOnTable(e.target.value == 'true')}
              >
                <option value={true}>Show</option>
                <option value={false}>Hide</option>
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={Boolean(props.details.is_visible_on_page)}
                onChange={(e) => showOnPage(e.target.value == 'true')}
              >
                <option value={true}>Show</option>
                <option value={false}>Hide</option>
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={props.details.width}
                onChange={(e) => setWidth(e.target.value)}
              >
                {width}
              </NativeSelect>
            </div>
          </Grid>
        </Grid>
        {isDropdown ? (
          <div>
            {dropDownFields.map((card, index) => (
              <div>{getField(index, card)}</div>
            ))}
            {dropDownFields.length < 11 ? (
              <div
                style={{
                  margin: 'auto',
                  marginTop: 20,
                  justifyContent: 'center',
                  width: 30,
                }}
              >
                <IconButton
                  edge="start"
                  color="primary"
                  aria-label="add"
                  style={{ padding: 0 }}
                  onClick={() => addField()}
                >
                  <AddButton style={{ fontSize: 20 }} />
                </IconButton>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {props.moveCard}
    </Paper>
  );
}
