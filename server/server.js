//var mqtt = require('mqtt');
client=null;

Accounts.onCreateUser(function (options, user) {
  // if (options.email.split('@')[1]!='theiler.io') {
  if (options.email!='lukas@theiler.io') {
    throw new Meteor.Error("not allowed")
    throwError('not allowed')
    return null;
  }
  return user;
});

Meteor.startup(function () {

  // Setup Restful API

  console.log("Startup")

   // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true,
    useClientRouter: false
  });

  Api.addCollection(Devices);

  // http://localhost:3000/api/addMeasurement/P07/DeepSleep30/199?msg=3
  Api.addRoute('addMeasurement/:device/:script/:series', {authRequired: false}, {
    get: function () {
      console.log("OK!!")
      console.log({device:this.urlParams.device, script: this.urlParams.script, series:this.urlParams.series,msg: this.queryParams.msg})
      Meteor.call("addMeasurement",{device:this.urlParams.device, script: this.urlParams.script, series:this.urlParams.series, msg: this.queryParams.msg})
      return {status: "success", data: "OK"};

    }
  })

  // Setup mqtt
  client = mqtt.connect('tcp://croft.thethings.girovito.nl:1883');
  client.on('message', Meteor.bindEnvironment(function(topic, message) {
    console.log("topic");
    console.log(topic.toString());
    console.log("message");
    console.log(message.toString());
    const msg=JSON.parse(message.toString())
    if (topic.startsWith('gateways')) {
      Meteor.call("addMeasurement",{device:"Gateway",script:msg.eui})
    }
    if (topic.startsWith('nodes')) {
      data=JSON.parse(new Buffer(msg.data, 'base64').toString('ascii'))
      console.log(data);
      let device="Unknown"
      let script="Unknown"
      let series="Unknown"
      if (data.d==0) {
        device='Monteino'
        script=msg.nodeEui
        series='S180'
      }
      if (data.d==9) {
        device='Monteino'
        script=msg.nodeEui
        series='USB-5V'
      }
      Meteor.call("addMeasurement",{device:device,script:script,series:series,msg:data.c})
    }
  }))

  // nodes/FEEDBEEF/packets
  client.on('connect', Meteor.bindEnvironment(function() {
    //client.subscribe('gateways/B827EBFFFEC7F595/status');
    for (let i=0; i<10; i++) {
      client.subscribe('nodes/AFFE270'+i+'/packets');
      console.log('subscribe: nodes/AFFE270'+i+'/packets')
    }
  }))

  // update status every minute
  Meteor.setInterval(function(){
    let devices=Devices.find().fetch();
    devices.forEach(x => {
      let status='finished'
      let now=new Date()
      let mins=((now-x.last)/1000/60)
      if ( mins < 3 ) {
        status='running'
      } else if ( mins < 5 ) {
        status='walking'
      }
      Devices.update({_id:x._id}, {$set: {status:status}})
    })
  }, 60*1000)

});

Meteor.methods({
  "addMeasurement": function({device, script, series, msg}) {
    console.log("AddMeasurement")
    var p=Devices.findOne({device:device, script:script, series:series, lock: {$ne: true}})
    if (!p) {
      Devices.insert({device:device, script:script, series:series, start:new Date(), msg:msg, last:new Date(), status:'running'})
      return
    } else {
      Devices.update({_id:p._id},{$set:{last:new Date(), msg: msg, status:'running'}})
    }
  },
  "deleteMeasurement": function(id) {
    if (!this.userId) return;
    console.log("remove: "+id)
    Devices.remove({_id:id})
  },
  "toggleLockMeasurement": function(id) {
    if (!this.userId) return;
    let d=Devices.findOne({_id:id})
    d.lock ? d.lock=false : d.lock=true
    Devices.update({_id:id}, {$set: {lock:d.lock} } )
  },
  "mqttReConnect": function(){
    client.removeAllListeners()
    Nodes.find().fetch().forEach(x => {

    })
  }
})
