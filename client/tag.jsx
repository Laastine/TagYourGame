/** @jsx React.DOM */


var TagYourGameSocketMixin = function (socketIo) {

    var transmitted;

    if (socketIo) {
   
      var socket = window.io.connect('http://localhost:3000');
      return {
            changeHandler: function (data) {
              // assuming its always a player update!
              var players = this.state.global.players
              var their = data.player
              var mine = _.find(players, function (a) { return their.name === a.name })
              if ( ! mine) {
                players.push(their)
              } else if ( ! _.isEqual(their, mine)) {
                mine.x = their.x
                mine.y = their.y
                var update = { global: { players: players }}
                this.setState(update);
              }
            },
            componentWillUpdate: function (props, state) {
              if ( ! _.isEqual(transmitted, state.player)) {
                socket.emit('component-change', { player: state.player });
                transmitted = _.clone(state.player)
              }
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

var moves = {
  down: [0, 1, 3, 4, 5, 6, 8, 9],
  up: [0,1,3,4,7,10,11],
  right: [0,2,4,5,6,7,8,10],
  left: [0,2,3,5,6,7,9,11]
}

var size = board.length

var socketMixin = TagYourGameSocketMixin(true)

var TransitionGroup = React.addons.TransitionGroup;
var classSet = React.addons.classSet;

var Block = React.createClass({
  render: function() {
    var classes = {
      'block': true,
      'block-player': this.props.player,
      'block-enemy': this.props.enemy,
      'block-empty': !this.props.player && !this.props.enemy,
      'block-moveable': this.props.moveable,
      'block-los-out': this.props.losOut
    }
    
    var icon;
    if (this.props.enemy) 
      icon = 'url(img/Enemy.png) no-repeat, '
    else if (this.props.player) 
      icon = 'url(img/Player.png) no-repeat, '
    else 
      icon = ''
    
    var styles = {
      'background': icon + 'url(img/' + this.props.backgroundImage + '.png) no-repeat'
    }
    return <div className={classSet(classes)} style={styles} onClick={this.props.onClick} />
  }
});

var TagYourGame = React.createClass({

  mixins: [socketMixin],
  
  getInitialState: function() {
    var n = prompt("anna nimi!")
    var x = Math.floor((Math.random() * size))
    var y = Math.floor((Math.random() * size))
    var p = {name: n, x: x, y: y}
    var sees = this.sees(p, board)
    return {
      board: board,
      player: p,
      global: {
        players: []
      },
      sees: sees,
      moveables: this.moveables(p, sees)
    }
  },

  tryMove: function(i, j) {
    var player = this.me()
    var desired = {x: i, y: j}
    if (this.canMove(player, desired)) {
      this.move(player, desired)
    }
  },
  
  canMove: function(from, to) {
    return !!_.find(this.state.moveables, function (a) { return a.x === to.x && a.y === to.y })
  },
  
  move: function(player, to) {
    var sees = this.sees(to)
    var moveables = this.moveables(to, sees)
    player.x = to.x
    player.y = to.y
    this.setState({
      player: player,
      moveables: moveables,
      sees: sees
    })
  },

  sees: function(from, board) {
    from = from || this.me()
    board = board || this.state.board
    
    var goWhere = function (allowed, next) {
      var go = function fn (acc, x, y) {
        var tile = board[x][y]
        if (_.contains(allowed, tile)) {
          var n = next(x, y)
          acc.push(n)
          return fn(acc, n.x, n.y)
        } else {
          return acc
        }
      }
      return go
    }
    
    var goDown = goWhere(moves.down, function (i, j) { return {x: i + 1, y: j} })
    var goUp = goWhere(moves.up, function (i, j) { return {x: i - 1, y: j} })
    var goLeft = goWhere(moves.left, function (i, j) { return {x: i, y: j - 1} })
    var goRight = goWhere(moves.right, function (i, j) { return {x: i, y: j + 1} })
      
    var x = from.x
    var y = from.y
    var all = [{x: x, y: y}].concat(goDown([], x, y), goUp([], x, y), goLeft([], x, y), goRight([], x, y))
    return all
  },
  
  moveables: function(from, sees) {
    from = from || this.me()
    sees = sees || this.state.sees
    return _.filter(sees, function (a) { 
      var xx = Math.abs(from.x - a.x)
      var yy = Math.abs(from.y - a.y)
      return (xx === 1 && yy === 0) || (xx === 0 && yy === 1)
    })
  },
  
  me: function() {
    var s = this.state
    return s.player
  },
  
  containsMe: function(i, j) {
    var s = this.state
    var me = this.me()
    return me.x === i && me.y === j
  },
  
  containsEnemy: function(i, j) {
    var s = this.state
    return !this.containsMe(i, j) && !! _.find(s.global.players, function(a) { return a.x === i && a.y === j })
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
                        player={this.containsMe(i, j)}
                        enemy={this.containsEnemy(i, j)}
                        backgroundImage={cell}
                        moveable={_.find(this.state.moveables, function (a) { return a.x === i && a.y === j })}
                        losOut={!_.find(this.state.sees, function (a) { return a.x === i && a.y === j })}
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