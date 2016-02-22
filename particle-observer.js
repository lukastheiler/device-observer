Particles=new Meteor.Collection("particles");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  UI.registerHelper('formatTime', function(context, options) {
    if(context)
      return moment(context).format('YYYY-MM-DD hh:mm:ss');
  });


  Template.particles.helpers({
    particles:function(){
      return Particles.find()
    }, 
    duration: function() {
      let p=Particles.findOne(this._id)
      if (!p) { return; }
      return moment.duration(moment(p.last).diff(p.start)).humanize()
    }
  });

  Template.particles.events({
    'click .js-delete-measuremet': function () {
      // increment the counter when button is clicked
      console.log("delete!"+this._id)
      Meteor.call("deleteMeasurement",this._id);
    }
  });
}   

if (Meteor.isServer) {

  Meteor.startup(function () {
     console.log("Startup")

     // Global API configuration
    var Api = new Restivus({
      useDefaultAuth: true,
      prettyJson: true, 
      useClientRouter: false
    });

    Api.addCollection(Particles);

    // Maps to: /api/articles/:id
    Api.addRoute('addMeasurement/:particle/:script/:series', {authRequired: false}, {
      get: function () {
        Meteor.call("addMeasurement",this.urlParams.particle, this.urlParams.script, this.urlParams.series)
        return {status: "success", data: "OK"};

      }
    })

    // code to run on server at startup
    if (!Particles.findOne()) {
      Meteor.call("addMeasurement","scriptOne")
      Meteor.call("addMeasurement","scriptTwo")
      Meteor.setTimeout( function(){
        Meteor.call("addMeasurement","scriptOne")
      }, 5000);
      Meteor.setTimeout( function(){
        Meteor.call("addMeasurement","scriptTwo")
      }, 10000);

    }
  });

  Meteor.methods({
    "addMeasurement": function(particle, script, series) {
      console.log("AddMeasurement")
      var p=Particles.findOne({script:script})
      if (!p) {
        Particles.insert({particle:particle, script:script, series:series, start:new Date(), last:new Date()})
        return
      } else {
        Particles.update({_id:p._id},{$set:{last:new Date()}})
      }
    }, 
    "deleteMeasurement": function(id) {
      console.log("remove: "+id)
      Particles.remove({_id:id})
    },
  })
}
