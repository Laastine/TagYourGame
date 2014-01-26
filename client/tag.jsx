/** @jsx React.DOM */


var TagYourGameSocketMixin = function (socketIo) {

    if (socketIo) {
   
      var socket = window.io.connect('http://localhost:3000');

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
      'block-possible': this.props.possible,
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
    var pp = [ {name: 'A', x: 0, y: 0}, {name: 'B', x:10, y:10} ]
    return {
      board: board,
      player: n,
      publics: {
        players: pp
      },
      sees: this.sees(_.find(pp, function (a) { return a.name === n }), board),
      possibles: [[0,1],[1,0]]
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
    var xx = Math.abs(from.x - to.x)
    var yy = Math.abs(from.y - to.y)
    return  (xx === 1 && yy === 0) || (xx === 0 && yy === 1)
  },
  
  move: function(from, to) {
    var i = to.x // TODO
    var j = to.y // TODO
    this.setState({
      publics: { players: this.state.publics.players.map(function(a) { if (a === from) { a.x = i; a.y = j} return a; } )},
      possibles: [[i + 1, j], [i, j + 1], [i - 1, j], [i, j - 1]], // TODO
      sees: this.sees()
    })
  },

  sees: function(from, board) {
    from = from || this.me()
    board = board || this.state.board
    
    function goDown(acc, x, y) {
      var tile = board[x][y]
      if (_.contains([0, 1, 3, 4, 5, 6, 8, 9], tile)) // can see down
        return goDown(acc.concat([{x: x + 1, y: y}]), x + 1, y)
      else
        return acc
    }
    
    function goUp(acc, x, y) {
      var tile = board[x][y]
      if (_.contains([0,1,3,4,7,10,11], tile)) // can see up    
        return goUp(acc.concat([{x: x - 1, y: y}]), x - 1, y)
      else
        return acc
    }
    
    function goLeft(acc, x, y) {
      var tile = board[x][y]
      if (_.contains([0, 2,5,6,7,9,11], tile)) // can see left
        return goLeft(acc.concat([{x: x, y: y - 1}]), x, y - 1)
      else 
        return acc
    }
    
    function goRight(acc, x, y) {
      var tile = board[x][y]
      if (_.contains([0,2,4,5,6,7,8,10], tile))  // can see right
        return goRight(acc.concat([{x: x, y: y + 1}]), x, y + 1)
      else
        return acc
    }
    var x = from.x
    var y = from.y
    var all = [{x: x, y: y}].concat(goDown([], x, y), goUp([], x, y), goLeft([], x, y), goRight([], x, y))
    return all
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