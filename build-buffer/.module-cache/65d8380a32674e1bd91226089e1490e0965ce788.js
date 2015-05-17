

/*
var Router = require('react-router')
  , RouteHandler = Router.RouteHandler
  , Route = Router.Route;


var ReactRouterBootstrap = require('react-router-bootstrap')
  , NavItemLink = ReactRouterBootstrap.NavItemLink
  , ButtonLink = ReactRouterBootstrap.ButtonLink
  , ListGroupItemLink = ReactRouterBootstrap.ListGroupItemLink;
*/

var ReactBootstrap = require('react-bootstrap')
  , DropdownButton = ReactBootstrap.DropdownButton
  , MenuItem = ReactBootstrap.MenuItem
  , Button = ReactBootstrap.Button
  , ButtonGroup = ReactBootstrap.ButtonGroup
  , OverlayTrigger = ReactBootstrap.OverlayTrigger
  , Popover = ReactBootstrap.Popover
  , Glyphicon = ReactBootstrap.Glyphicon
  , Grid = ReactBootstrap.Grid
  , Col = ReactBootstrap.Col
  , Row = ReactBootstrap.Row

var React = require('react');
var Router = require('react-router');
var { Route, DefaultRoute, RouteHandler, Link } = Router;

var Home = require("./home/Home.js");
var Profile = require("./profile/Profile.js");
var SetIntervalMixin = require("./common/SetIntervalMixin.js");
var SafeStateChangeMixin = require('./common/SafeStateChangeMixin.js');
var Timeline = require('./profile/Timeline.js');
var Followings = require('./profile/Followings.js');
var Mentions = require('./profile/Mentions.js');
var Conversation = require('./other/Conversation.js');
var Settings = require('./other/Settings.js');
var AppSettingsMixin = require('./common/AppSettingsMixin.js');

App = React.createClass({displayName: "App",
    
  mixins: [AppSettingsMixin,SetIntervalMixin,SafeStateChangeMixin],
  
  contextTypes: {
    router: React.PropTypes.func
  },

  getHandlerKey: function () {
    var childDepth = 1; // assuming App is top-level route
    var { router } = this.context;
    //console.log(router.getCurrentParams())
    if ( router.getCurrentRoutes()[childDepth] ) {
      var key = router.getCurrentRoutes()[childDepth].name;
      if (key=="home" || key=="profile-active" || key=="accountProfileMore") {key=key+"/"+this.state.activeAccount;}
      var id = JSON.stringify(router.getCurrentParams());
      if (id) { key += id; }
      //console.log(key);
      return key;
    } else {return "none"}
  },
  
  clearCache: function () {
    localStorage.setItem("twister-cache", null);
  },
  
  saveCache: function () { 
    localStorage.setItem("twister-cache", JSON.stringify(Twister.serializeCache()))
  },
  
  switchAccount: function (newaccoutname) {
    
    //console.log(newaccoutname);
    
    var thisComponent = this;
    
    Twister.getAccount(newaccoutname).activateTorrents(function(){
      thisComponent.setStateSafe({activeAccount: newaccoutname},function(){
        localStorage.setItem("twister-react-activeAccount", newaccoutname);
      });
    });
    
  },
  
  getInitialState: function () {
    
    var state={};
    
    state.activeAccount = localStorage.getItem("twister-react-activeAccount")
    
    state.accounts = Twister.getAccounts();
    
    if (!state.activeAccount) { state.activeAccount=state.accounts[0]; }
    
    //console.log(state);
  
    return state;
    
  },
  
  componentDidMount: function () {
    
    this.setInterval(this.saveCache,300000);

  },
  
  render: function() {
    
    var firstroute = this.context.router.getCurrentRoutes()[1].name;
    
    //console.log(firstroute);
    
    var userbuttons = [];
    for (var i in this.state.accounts) {
      userbuttons.push(
        React.createElement(MenuItem, {
          key: this.state.accounts[i], 
          bsStyle: this.state.accounts[i]==this.state.activeAccount ? 'primary' : 'default', 
          onClick: this.switchAccount.bind(this,this.state.accounts[i]), 
          href: "javascript:void(0);"
        }, this.state.accounts[i])
      );
    }
    
    return (
      React.createElement(Grid, null, 
        React.createElement(Row, null, 
          React.createElement(Col, {xs: 12, sm: 10, smOffset: 1, md: 8, mdOffset: 2, lg: 6, lgOffset: 3}, 
            React.createElement(ButtonGroup, {justified: true}, 
              React.createElement(Button, {
                href: "#", 
                bsStyle: firstroute=="home" ? 'primary' : 'default'
              }, React.createElement(Glyphicon, {glyph: "home"})), 
              React.createElement(Button, {
                href: "#/profile", 
                bsStyle: firstroute=="profile-active" ? 'primary' : 'default'
              }, React.createElement(Glyphicon, {glyph: "user"})), 
              React.createElement(Button, {href: "#/directmessages"}, React.createElement(Glyphicon, {glyph: "transfer"})), 
              React.createElement(DropdownButton, {title: this.state.activeAccount}, 
                userbuttons
              ), 
              React.createElement(DropdownButton, {title: React.createElement(Glyphicon, {glyph: "menu-hamburger"})}, 
                React.createElement(MenuItem, {
                  onClick: this.clearCache, 
                  href: "javascript:void(0);"
                }, "Clear Cache"), 
                React.createElement(MenuItem, {href: "#/search"}, "Search"), 
                React.createElement(MenuItem, {href: "#/settings"}, "Settings"), 
                React.createElement(MenuItem, {href: "#/howtofollow"}, "How to Follow"), 
                React.createElement(MenuItem, {href: "#/trendinghashtags"}, "Trending Hashtags")
              )
            ), 
            React.createElement("br", null), 
            React.createElement(RouteHandler, {
              activeAccount: this.state.activeAccount, 
              key: this.getHandlerKey()}
            )
          )
        )
      )
    );
  }
});


var routes = (
  React.createElement(Route, {handler: App, path: "/"}, 
    React.createElement(Route, {name: "profile-active", path: "/profile", handler: Profile}, 
      React.createElement(Route, {name: "profile-active-timeline", path: "timeline", handler: Timeline}), 
      React.createElement(Route, {name: "profile-active-followings", path: "followings", handler: Followings}), 
      React.createElement(Route, {name: "profile-active-mentions", path: "mentions", handler: Mentions}), 
      React.createElement(DefaultRoute, {name: "profile-active-timeline-default", handler: Timeline})
    ), 
    React.createElement(Route, {name: "profile", path: "/profile/:username", handler: Profile}, 
      React.createElement(Route, {name: "profile-timeline", path: "timeline", handler: Timeline}), 
      React.createElement(Route, {name: "profile-followings", path: "followings", handler: Followings}), 
      React.createElement(Route, {name: "profile-mentions", path: "mentions", handler: Mentions}), 
      React.createElement(DefaultRoute, {name: "profile-timeline-default", handler: Timeline})
    ), 
    React.createElement(Route, {name: "conversation", path: "/conversation/:username/:postid", handler: Conversation}), 
    React.createElement(Route, {name: "settings", path: "/settings", handler: Settings}), 
    React.createElement(DefaultRoute, {name: "home", handler: Home})
  )
);


initializeApp = function () {
    
  Router.run(routes, function (Handler) {
    React.render(React.createElement(Handler, null), document.getElementById('content'));
  });
   
}

Twister.deserializeCache(JSON.parse(localStorage.getItem("twister-cache")));

var accounts = Twister.getAccounts();

if (accounts.length==0) {

  if (!localStorage.getItem("twister-react-settings")) {

    var appSettings = {

      pollInterval:60,
      pollIntervalProfile: 3600,
      ignoredUsers: "nobody",
      host: "http://user:pwd@localhost:28332",
      logging: false

    };

  } else {

    var appSettings = JSON.parse(localStorage.getItem("twister-react-settings"));

  }
  
  Twister.setup({
    host: appSettings.host,
    logfunc: function(log){console.log(log)},
    outdatedLimit: appSettings.pollInterval,
    querySettingsByType: {

      outdatedLimit: {
          pubkey: appSettings.pollIntervalProfile,
          profile: appSettings.pollIntervalProfile,
          avatar: appSettings.pollIntervalProfile,
          torrent: appSettings.pollIntervalProfile,
          followings: appSettings.pollIntervalProfile
      }

    }
  });

  Twister.loadServerAccounts(function(){

    initializeApp();

  });

} else {

    initializeApp();
}

////// INIT EVENTLISTENERS ON WINDOW

window.onscroll = function(ev) {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
    var event = new Event('scrolledtobottom');
    //alert("scrolled to bottom")
    window.dispatchEvent(event);
  }
};