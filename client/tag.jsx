/** @jsx React.DOM */


var TagYourGameSocketMixin = function () {
  var transmitted;
  var socket = window.io.connect('');
  return {
    changeHandler: function (data) {
      // assuming its always a player update!
      var players = this.state.global.players
      var their = data.player
      var mine = _.find(players, function (a) { return their.id === a.id })
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
  }
}

function guid() {
  // rfc4122 version 4 compliant 
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

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

var connectedSocketMixin = TagYourGameSocketMixin()

var TransitionGroup = React.addons.TransitionGroup;
var classSet = React.addons.classSet;

var Block = React.createClass({
  render: function() {
    var classes = {
      'block': true,
      'block-empty': !this.props.player && !this.props.runner && !this.props.chaser,
      'block-moveable': this.props.moveable,
      'block-los-out': this.props.losOut
    }
    
    var icon;
    if (this.props.player && ! this.props.isPlayerChaser)
      icon = 'url(img/player.png) no-repeat, '
    else if (this.props.player && this.props.isPlayerChaser)
      icon = 'url(img/player_tag.png) no-repeat, '
    else if (this.props.runner) 
      icon = 'url(img/Enemy.png) no-repeat, '
    else if (this.props.chaser)
      icon = 'url(img/Enemy_tag.png) no-repeat, '
    else
      icon = ''
    
    var styles = {
      'background': icon + 'url(img/' + this.props.backgroundImage + '.png) no-repeat'
    }
    return <div className={classSet(classes)} style={styles} onClick={this.props.onClick} />
  }
});

var TagYourGame = React.createClass({

  mixins: [connectedSocketMixin],
  
  getInitialState: function() {
    var n = guid();
    var chaser = Math.floor((Math.random() * 10)) < 3 // 30% chance
    var x = Math.floor((Math.random() * size))
    var y = Math.floor((Math.random() * size))
    var p = {id: n, x: x, y: y, chaser: chaser}
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
  
  containsChaser: function(i, j) {
    var s = this.state
    return !this.containsMe(i, j) && !! _.find(s.global.players, function(a) { return a.x === i && a.y === j && a.chaser })
  },
  
  containsRunner: function(i, j) {
    var s = this.state
    return !this.containsMe(i, j) && !! _.find(s.global.players, function(a) { return a.x === i && a.y === j && ! a.chaser })
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
                        isPlayerChaser={this.state.player.chaser}
                        chaser={this.containsChaser(i, j)}
                        runner={this.containsRunner(i, j)}
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