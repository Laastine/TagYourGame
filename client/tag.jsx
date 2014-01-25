/** @jsx React.DOM */

var board = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

var socketMixin = function (socketIo) {

    if (socketIo) {
   
      var socket = window.io.connect('http://localhost:3000');

          return {
            changeHandler: function (data) {
              if (!_.isEqual(data.state, this.state) && this.path === data.path) {
                this.setState(data.state);
              }
            },

            componentWillUpdate: function (props, state) {
              console.log('componentWillUpdate')
              socket.emit('component-change', { path: this.path, state: state });
            },

            componentDidMount: function (root) {
              //this.path = utils.nodePath(root);
              console.log('componentDidMount')
              socket.on('component-change', this.changeHandler);
            },
            componentWillUnmount: function () {
              console.log('componentWillUnmount')
              socket.removeListener('component-change', this.change);
            }
          };
            
    } 
    else {
    
            var ms;
            var transport = 'websocket';
            var logged = false;
            var request = {
                url: "http://10.10.99.116:8080/server",
                contentType: "application/json",
                logLevel: 'debug',
                transport: transport,
                fallbackTransport: 'long-polling'
            };

              request.onOpen = function (response) {
                  
                  transport = response.transport;
                  if (response.transport == "local") {
                      subSocket.pushLocal("Name?");
                  }
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
                    if (!_.isEqual(data.state, this.state) && this.path === data.path) {
                      this.setState(data.state);
                    }
                  },

                  componentWillUpdate: function (props, state) {
                    console.log('componentWillUpdate')
                    socket.emit('component-change', { path: this.path, state: state });
                  },

                  componentDidMount: function (root) {
                    //this.path = utils.nodePath(root);
                    console.log('componentDidMount')
                    socket.on('component-change', this.changeHandler);
                  },
                  componentWillUnmount: function () {
                    console.log('componentWillUnmount')
                    socket.removeListener('component-change', this.change);
                  }
              };
    }
};

var connectedSocketMixin = socketMixin(false)

var TransitionGroup = React.addons.TransitionGroup;
var classSet = React.addons.classSet;

var Block = React.createClass({
  render: function() {
    var classes = {
      'tag': true,
      'tag-player-cell': this.props.player,
      'tag-enemy-cell': this.props.enemy,
      'tag-empty-cell': !this.props.player && !this.props.enemy,
      'tag-possible': this.props.possible,
      'tag-los-out': this.props.losOut
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
      player: {x: 0, y: 0},
      possibles: [[0,1],[1,0]]
    };
  },

  tryMove: function(i, j) {
    var player = this.state.player
    var desired = {x: i, y: j}
    if (this.moveAllowed(player, desired)) {
      this.move(player, desired)
    }
  },
  
  move: function(from, to) {
    var i = to.x // TODO
    var j = to.y // TODO
    this.setState({
      player: to,
      possibles: [[i + 1, j], [i, j + 1], [i - 1, j], [i, j - 1]] // TODO
    })
  },
  
  moveAllowed: function(from, to) {
    var xx = Math.abs(from.x - to.x)
    var yy = Math.abs(from.y - to.y)
    return  (xx === 1 && yy === 0) || (xx === 0 && yy === 1)
  },
    
  inLineOfSight: function(i, j) {
    var pos = this.state.player    
    return pos.x === i || pos.y === j
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
                        player={this.state.player.x === i && this.state.player.y === j}
                        enemy={false}
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