const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');
const moment = require('moment');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  let result=[];
  const objBuild = (mst, meterId) => {
    let myobj = {
      "_id": {
        "month": mst.getMonth() + 1,
        "year": mst.getYear() + 1900
      },
      "msT": mst.toISOString(),
      "total": 0.0,
      "peakLoad": 0.0,
      "meterId": meterId,
      "unit": "kWh",
      "power Factor": 0.0
    }

    return myobj;
  }

  const startDate = new Date("2021-01-30T18:00:00.000Z");  // from date
  const endDate = new Date("2021-05-20T18:29:59.999Z");   // to date

  let dateList=dateRange(startDate.toLocaleDateString("af"), endDate.toLocaleDateString("af"));
  console.log('dateList',dateList);
  var i;
  for (i = 0; i < dateList.length; i++) {
    const data = result[i];
    if (null != data) {
      if(!moment(dateList[i]).isSame(new Date(data.msT), 'month')){
        result.splice(i, 0, objBuild(new Date(dateList[i]), 'meter1')); // meterId
      }
    } else {
      result.splice(i, 0, objBuild(new Date(dateList[i]), 'meter2'));  // meterId
    }

  }
  // res.send(posts);
  res.send(result);
});
/////////////////////////////////////////////////////////////
app.get('/posts1', (req, res) => {
  const startDate = new Date("2018-12-31T18:29:00.000Z");  // from date
  const endDate = new Date("2021-12-31T18:29:59.999Z");   // to date
  first = startDate.getFullYear();
  second = endDate.getFullYear();
  let result=[];
  const objBuild = (mst, meterId) => {
    let myobj = {
      "_id": {
        "year": mst.getYear() + 1900
      },
      "msT": mst.toISOString(),
      "total": 0.0,
      "peakLoad": 0.0,
      "meterId": meterId,
      "unit": "kWh",
      "power Factor": 0.0
    }

    return myobj;
  }
  let dateList=[];
  for(i = first; i <= second; i++) {
    dateList.push(i+'-01'+'-01');
  }

  var i;
  for (i = 0; i < dateList.length; i++) {
    const data = result[i];
    if (null != data) {
      if(!moment(dateList[i]).isSame(new Date(data.msT), 'year')){
        result.splice(i, 0, objBuild(new Date(dateList[i]), 'meter1')); // meterId
      }
    } else {
      result.splice(i, 0, objBuild(new Date(dateList[i]), 'meter2'));  // meterId
    }

  }

  res.send(result);
});

/////////////////////////////weeekly////////////////////////////////////

app.get('/posts2', (req, res) => {

  const startDate = new Date("2021-01-01T18:30:00.000Z");  // from date
  const endDate = new Date("2021-01-18T18:29:59.999Z");   // to date
  let result=[];

  const objBuild = (mst, meterId) => {
    let myobj = {
      "_id": {
        "week": moment(mst).week(),
        "month": mst.getMonth() + 1,
        "year": mst.getYear() + 1900
      },
      "msT": mst.toISOString(),
      "total": 0.0,
      "peakLoad": 0.0,
      "meterId": meterId,
      "unit": "kWh",
      "power Factor": 0.0
    }

    return myobj;
  }

let dateList = [];
const theDate = new Date(startDate);
while (theDate < endDate) {
  dateList = [...dateList, new Date(theDate)]
  theDate.setDate(theDate.getDate() + 7)
}
if(dateList.length === 0){
  dateList.push(startDate);
}
if(moment(endDate).week() !== moment(dateList[dateList.length-1]).week()){
  dateList.push(endDate);
}

var i;
  for (i = 0; i < dateList.length; i++) {
    const data = result[i];
    if (null != data) {
      if (moment(dateList[i]).week() !== moment(data.msT).week()) {
        result.splice(i, 0, objBuild(new Date(dateList[i]), 'meter1')); // meterId
      }
    } else {
      result.splice(i, 0, objBuild(new Date(dateList[i]), 'meter2'));  // meterId
    }

  }

  res.send(result);
});

app.post('/posts', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = {
    id,
    title
  };

  await axios.post('http://localhost:4005/events', {
    type: 'PostCreated',
    data: {
      id,
      title
    }
  });

  res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  //console.log('Received Event', req.body.type);

  res.send({});
});
function dateRange(startDate, endDate) {
  var start      = startDate.split('-');
  var end        = endDate.split('-');
  var startYear  = parseInt(start[0]);
  var endYear    = parseInt(end[0]);
  var dates      = [];

  for(var i = startYear; i <= endYear; i++) {
    var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
    var startMon = i === startYear ? parseInt(start[1])-1 : 0;
    for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
      var month = j+1;
      var displayMonth = month < 10 ? '0'+month : month;
      let dt=[i, displayMonth, '01'].join('-');
      dates.push(new Date(dt));
    }
  }
  return dates;
}
app.listen(4000, () => {
  console.log('Listening on 4000');

  const startDate = new Date("2021-01-01T18:30:00.000Z");  // from date
  const endDate = new Date("2021-01-18T18:29:59.999Z");   // to date

let dateList = [];
const theDate = new Date(startDate);
while (theDate < endDate) {
  dateList = [...dateList, new Date(theDate)]
  theDate.setDate(theDate.getDate() + 7)
}
if(dateList.length === 0){
  dateList.push(startDate);
}
if(moment(endDate).week() !== moment(dateList[dateList.length-1]).week()){
  dateList.push(endDate);
}




});
