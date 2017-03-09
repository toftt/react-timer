class TimerApp extends React.Component {
  constructor(props) {
    super(props);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDurationChange = this.handleDurationChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.maxDuration = 460;
    this.state = {items: [{name: 'test', duration: 1 * 40, progress: 0, id: Date.now()}], nameText: '', durationText: '', on: false, elapsed: 0, scalar: 10.0};
  }

  render() {
    return (
      <div>
        <div className="btn-holder">
          <button className="btn" onClick={this.handleStart}>{this.state.on ? 'Pause' : 'Start'}</button>
          <button className="btn" onClick={this.handleReset}>reset</button>
        </div>
        <div id="timer">
          <Timer elapsed={this.state.elapsed} />
        </div>
        <TaskList items={this.state.items} scalar={this.state.scalar} maxDuration={this.maxDuration} handleDelete={this.handleDelete}/>
        <div style={{display: this.state.on ? 'none' : 'block'}}>
          <div id="editor_label">add task</div>
          <form onSubmit={this.handleSubmit}>
            <div id="task_editor">
              <label for="taskname">Task name</label>
              <input name="nameText"onChange={this.handleNameChange} value={this.state.nameText} />
              <label for="duration">Duration in seconds</label>
              <input name="durationText"onChange={this.handleDurationChange} value={this.state.durationText} />
              <button className="btn btn-small">add</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  tick() {
    this.setState((prevState) => ({
      elapsed: prevState.elapsed + 1,
      items: updateProgress(prevState.items, prevState.elapsed + 1)
    }));
  }

  handleDelete(id) {
    this.setState((prevState) => ({
      items: deleteItem(prevState.items, id)
    }));
  }

  handleReset() {
    if (this.state.on) {
      clearInterval(this.interval);
    }
    this.setState((prevState) => ({
      nameText: '',
      durationText: '',
      items: resetProgress(prevState.items),
      on: false,
      elapsed: 0,
    }));
  }

  handleStart() {
    if (!this.state.on) {
      this.interval = setInterval(() => this.tick(), 25);
    } else {
      clearInterval(this.interval);
    }

    this.setState((prevState) => ({
      on: !prevState.on
    }));
  }

  handleNameChange(e) {
    this.setState({nameText: e.target.value});
  }

  handleDurationChange(e) {
    this.setState({
      durationText: e.target.value.replace(/[^0-9]+/g, '')
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.durationText !== '') {
      let newItem = {
        name: this.state.nameText,
        duration: parseInt(this.state.durationText) * 40,
        progress: 0,
        id: Date.now()
      };

      const newScalar = Math.min(this.maxDuration / newItem.duration, this.state.scalar);

      this.setState((prevState) => ({
        durationText: '',
        items: prevState.items.concat(newItem),
        scalar: newScalar,
        nameText: ''
      }));
    }
  }
}

function TaskList(props) {
  return (
    <div id="bar_list">
      {
        props.items.map(item => {
          let ratio = item.progress / item.duration;
          let duration = item.duration * props.scalar;
          let progress = ratio * (duration - 6);
          return (
            <BarHolder duration={duration} progress={progress} text={item.name} handleDelete={props.handleDelete} itemid={item.id}/>
          )
        })
      }
    </div>
  );
}

class BarHolder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hover: false};
    this.handleEnter = this.handleEnter.bind(this);
    this.handleLeave = this.handleLeave.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  render() {
    return (
      <div className="bar-holder" onMouseEnter={this.handleEnter} onMouseLeave={this.handleLeave}>
        <Bar duration={this.props.duration} progress={this.props.progress} text={this.props.text} />
        <span>
          <i className="icon material-icons" style={{display: this.state.hover ? 'inline' : 'none'}}>mode_edit</i>
          <i className="icon material-icons" onClick={this._onClick} style={{display: this.state.hover ? 'inline' : 'none'}}>delete</i>
        </span>
      </div>
    )
  }

  _onClick() {
    this.props.handleDelete(this.props.itemid);
  }

  handleEnter() {
    this.setState(() => ({
      hover: true
    }));
  }

  handleLeave() {
    this.setState(() => ({
      hover: false
    }));
  }
}

function Bar(props) {
  return (
    <div className="outer-bar" style={{width: props.duration, display: 'inline-block'}}>
      <span className="bar-text" style={{width: props.duration - 6}}>
        {props.text}
      </span>
      <div className="inner-bar" style={{width: props.progress}}>
      </div>
    </div>
  );
}

function Timer(props) {
  return (
    <span>{(props.elapsed / 40).toFixed(2)}</span>
  );
}

function updateProgress(items, elapsed) {
  for (let i in items) {
    if (elapsed <= items[i].duration) {
      items[i].progress = elapsed;
      elapsed = 0;
      break;
    } else {
      items[i].progress = items[i].duration;
      elapsed -= items[i].duration;
    }
  }
  return items;
}

function deleteItem(items, id) {
  let newItems = [];
  for (let item of items) {
    if (item.id !== id) {
      newItems.push(item);
    }
  }
  return newItems;
}

function resetProgress(items) {
  for (let i in items) {
    items[i].progress = 0;
  }
  return items;
}

ReactDOM.render(<TimerApp />, mountNode);
