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

var TransitionGroup = React.addons.TransitionGroup;
var classSet = React.addons.classSet;

var Block = React.createClass({
  render: function() {
    var classes = {
      'tag': true,
      'tag-current': this.props.current,
      'tag-not-current': !this.props.current,
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
                        current={this.state.player.x === i && this.state.player.y === j}
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