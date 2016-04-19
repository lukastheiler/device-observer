
// Tracker.autorun(function (c) {
//   var count = Errors.find({userId:Meteor.userId()}).fetch().length
//   console.log("TRACKER +1, "+count)
// //  c.stop();
// //  alert("Oh no!");
// });
//
// Errors.after.insert(function (userId, doc) {
//   console.log("asdfasdf!")
// })

UI.registerHelper('formatTime', function(context, options) {
  if(context)
    return moment(context).format('YYYY-MM-DD HH:mm:ss');
});

isLocked=function(device){
  return device.lock ? true : false;
}

Template.body.onCreated(function bodyOnCreated() {
  //this.state = new ReactiveDict();
  Meteor.subscribe('devices');
});

Template.devices.helpers({
  devices:function(){
    return Devices.find()
  },
  duration: function() {
    let p=Devices.findOne(this._id)
    if (!p) { return; }
    return moment.duration(moment(p.last).diff(p.start)).humanize()
  },
  running: function(){
    if (this.status=='running') {
      return '<span class="label label-success">Running</span>'
    } else if (this.status=='walking') {
      return '<span class="label label-warning">Walking</span>'
    } else {
      return '<span class="label label-default">Finished</span>'
    }
  },
  lockColor: function(){
    return (isLocked(this) ? 'black' : 'gray')
  },
  trashColor: function(){
    return (isLocked(this) ? 'gray' : 'black')
  },
});

Template.devices.events({
  'click .js-delete-measuremet': function () {
    if (isLocked(this)) return;
    if (confirm("Are you sure you want to delete?")) {
      Meteor.call("deleteMeasurement",this._id);
    }
  },
  'click .js-lock': function () {
    Meteor.call("toggleLockMeasurement",this._id);
  }

});
