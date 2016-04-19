Devices=new Meteor.Collection("devices");

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('devices', function devicesPublication() {
    return Devices.find();
  });
}

// simplicty, allow updates for logged in user
Devices.allow({
  update: function(userId, doc, fieldNames, modifier) {
    if (!Meteor.userId()) return false;
    return true;
  }
})
