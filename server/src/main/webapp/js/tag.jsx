/** @jsx React.DOM */


var socketMixin = function (socketIo) {

    if (false) {
   
      var socket = window.io.connect('http://localhost:8080');

      return {
            changeHandler: function (data) {
              if (!_.isEqual(data.state.publics, this.state.publics)) {
                var update = {publics: data.state.publics }
                console.log(update)
                this.setState(update);
              }
            },
            componentWillUpdate: function (props, state) {
              socket.emit('component-change', { state: state });
            },
            componentDidMount: function (root) {
              socket.on('component-change', this.changeHandler);
            },
            componentWillUnmount: function () {
              socket.removeListener('component-change', this.change);
            }
        };
            
    } 
    else {
    
            var ms;
            var transport = 'websocket';
            var logged = false;
            var request = {
                url: "http://localhost:8080",
                contentType: "application/json",
                logLevel: 'debug',
                transport: transport,
                fallbackTransport: 'long-polling'
            };

              request.onOpen = function (response) {
                  transport = response.transport;
              };

              request.onReconnect = function (rq, rs) {
                  ms.info("Reconnecting")
              };

              request.onMessage = function (rs) {

                  var message = rs.responseBody;
                  try {
                      var json = jQuery.parseJSON(message);
                      console.log("Got a message")
                      console.log(json)
                  } catch (e) {
                      console.log('This doesn\'t look like a valid JSON object: ', message.data);
                      return;
                  }

                  if (!logged) {
                      logged = true;
                      subSocket.pushLocal("heippa");
                  } else {
                      console.log(json)
                  }
              };

              request.onClose = function (rs) {
                  console.log('aaaa')
              };

              request.onError = function (rs) {

              console.log('error')
              };

              ms = window.atmosphere.subscribe(request);
              
              return {
                  changeHandler: function (data) {
                    if (!_.isEqual(data.state, this.state)) {
                      this.setState(data.state);
                    }
                  },
                  componentWillUpdate: function (props, state) {
                    socket.emit('component-change', { state: state });
                  },
                  componentDidMount: function (root) {
                    socket.on('component-change', this.changeHandler);
                  },
                  componentWillUnmount: function () {
                    socket.removeListener('component-change', this.change);
                  }
              };
    }
};


var board = [
  [8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 9], 
  [4, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], 
  [4, 0, 0, 0, 1, 4, 7, 7, 7, 0, 0, 0, 0, 0, 3], 
  [4, 0, 0, 0, 0, 2, 2, 2, 2, 3, 4, 0, 2, 0, 3], 
  [4, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3], 
  [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], 
  [4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], 
  [4, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3], 
  [4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], 
  [4, 0, 0, 0, 0, 5, 0, 0, 2, 2, 2, 2, 0, 0, 3], 
  [4, 0, 0, 0, 0, 1, 0, 0, 6, 0, 0, 0, 0, 0, 3], 
  [4, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3], 
  [4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3], 
  [4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3], 
  [10, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 11]
];

var connectedSocketMixin = socketMixin(true)

var TransitionGroup = React.addons.TransitionGroup;
var classSet = React.addons.classSet;

var Block = React.createClass({
  render: function() {
    var classes = {
      'block': true,
      'block-player': this.props.player,
      'block-enemy': this.props.enemy,
      'block-empty': !this.props.player && !this.props.enemy,
      'block-possible': this.props.possible,
      'block-los-out': this.props.losOut
    }
    var styles = {
      'background-image': "url('img/" + this.props.backgroundImage + ".png')"
    }
    return <div className={classSet(classes)} style={styles} onClick={this.props.onClick} />
  }
});

var TagYourGame = React.createClass({

  mixins: [connectedSocketMixin],
  
  getInitialState: function() {
    return {
      board: board,
      player: prompt("anna nimi!"),
      publics: {
        players: [ {name: 'A', x: 0, y: 0}, {name: 'B', x:10, y:10} ]
      },
      possibles: [[0,1],[1,0]]
    };
  },

  tryMove: function(i, j) {
    var player = this.me()
    var desired = {x: i, y: j}
    if (this.canMove(player, desired)) {
      this.move(player, desired)
    }
  },
  
  move: function(from, to) {
    var i = to.x // TODO
    var j = to.y // TODO
    this.setState({
      publics: { players: this.state.publics.players.map(function(a) { if (a === from) { a.x = i; a.y = j} return a; } )},
      possibles: [[i + 1, j], [i, j + 1], [i - 1, j], [i, j - 1]] // TODO
    })
  },
  
  canMove: function(from, to) {
    var xx = Math.abs(from.x - to.x)
    var yy = Math.abs(from.y - to.y)
    return  (xx === 1 && yy === 0) || (xx === 0 && yy === 1)
  },
    
  inLineOfSight: function(i, j) {
    var pos = this.me()  
    return pos.x === i || pos.y === j
  },
  
  me: function() {
    var s = this.state
    return _.find(s.publics.players, function(a) { return a.name == s.player })
  },
  
  containsMe: function(i, j) {
    var s = this.state
    var me = this.me()
    return me.x === i && me.y === j
  },
  
  containsEnemy: function(i, j) {
    var s = this.state
    return !this.containsMe(i, j) && !! _.find(s.publics.players, function(a) { return a.x === i && a.y === j })
  },
  
  render: function() {
    return (
    <div>
        {
          this.state.board.map(function(row, i) {
            return (
              <TransitionGroup
                transitionName="tag"
                component={React.DOM.div}
              >
                {
                  row.map(function(cell, j) {
                    return (
                      <Block
                        player={this.me().x === i && this.me().y === j}
                        enemy={this.containsEnemy(i, j)}
                        backgroundImage={cell}
                        possible={this.state.possibles.reduce(function(acc, a) { return acc || i === a[0] && j == a[1] }, false)}
                        losOut={!this.inLineOfSight(i, j)}
                        onClick={this.tryMove.bind(this, i, j)}
                      />
                    )
                  }, this)
                }
              </TransitionGroup>
            )
          }, this)
        }
      </div>
    );
  }
});

React.renderComponent(<TagYourGame />, document.getElementById('game'))