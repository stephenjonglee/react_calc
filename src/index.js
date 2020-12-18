// Stephen Lee

// Imports
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PointTarget from 'react-point';

// Class Text
class Text extends React.Component {
    // state has scale that for styling
    // 1 is the biggest scaler
    state = {
        scale: 1
    };
  
    componentDidUpdate() {
        const { scale } = this.state
        
        const node = this.node
        const parentNode = node.parentNode
        
        const availableWidth = parentNode.offsetWidth
        const actualWidth = node.offsetWidth
        const actualScale = availableWidth / actualWidth
        
        if (scale === actualScale) {return}
        
        // change scale is scale is different
        if (actualScale < 1) {
            this.setState({ scale: actualScale })
        } else if (scale < 1) {
            this.setState({ scale: 1 })
        }
    }
    
    render() {
        const { scale } = this.state
        
        return (
        <div
            className="auto-scaling-text"
            style={{ transform: `scale(${scale},${scale})` }}
            ref={node => this.node = node}
        >{this.props.children}</div>
        )
    }
}

// Class Displays the Calculator
class Display extends React.Component {
    render() {
        const { value, ...props } = this.props
        
        let formattedValue = parseFloat(value).toLocaleString(undefined, {
        useGrouping: true,
        maximumFractionDigits: 6
        })
        
        // Using regular expressions
        // Add back missing .0 in e.g. 12.0
        const match = value.match(/\.\d*?(0*)$/)
        
        if (match)
        formattedValue += (/[1-9]/).test(match[0]) ? match[1] : match[0]
        
        return (
        <div {...props} className="calculator-display">
            <Text>{formattedValue}</Text>
        </div>
        )
    }
}

// Class Keys
class Key extends React.Component {
  render() {
    const { onPress, className, ...props } = this.props
    
    return (
      <PointTarget onPoint={onPress}>
        <button className={`calculator-key ${className}`} {...props}/>
      </PointTarget>
    )
  }
}

// equations for calculations
const CalculatorOperations = {
  '/': (prevValue, nextValue) => prevValue / nextValue,
  '*': (prevValue, nextValue) => prevValue * nextValue,
  '+': (prevValue, nextValue) => prevValue + nextValue,
  '-': (prevValue, nextValue) => prevValue - nextValue,
  '=': (prevValue, nextValue) => nextValue
}

// Class Calculator
class Calculator extends React.Component {
  state = {
    value: null,
    displayValue: '0',
    operator: null,
    waitingForOperand: false
  };
  
  clearAll() {
    this.setState({
      value: null,
      displayValue: '0',
      operator: null,
      waitingForOperand: false
    })
  }

  clearDisplay() {
    this.setState({
      displayValue: '0'
    })
  }
  
  clearLastChar() {
    const { displayValue } = this.state
    
    this.setState({
      displayValue: displayValue.substring(0, displayValue.length - 1) || '0'
    })
  }
  
  toggleSign() {
    const { displayValue } = this.state
    const newValue = parseFloat(displayValue) * -1
    
    this.setState({
      displayValue: String(newValue)
    })
  }
  
  inputPercent() {
    const { displayValue } = this.state
    const currentValue = parseFloat(displayValue)
    
    if (currentValue === 0)
      return
    
    const fixedDigits = displayValue.replace(/^-?\d*\.?/, '')
    const newValue = parseFloat(displayValue) / 100
    
    this.setState({
      displayValue: String(newValue.toFixed(fixedDigits.length + 2))
    })
  }
  
  inputDot() {
    const { displayValue } = this.state
    
    if (!(/\./).test(displayValue)) {
      this.setState({
        displayValue: displayValue + '.',
        waitingForOperand: false
      })
    }
  }
  
  inputDigit(digit) {
    const { displayValue, waitingForOperand } = this.state
    
    if (waitingForOperand) {
      this.setState({
        displayValue: String(digit),
        waitingForOperand: false
      })
    } else {
      this.setState({
        displayValue: displayValue === '0' ? String(digit) : displayValue + digit
      })
    }
  }
  
  performOperation(nextOperator) {    
    const { value, displayValue, operator } = this.state
    const inputValue = parseFloat(displayValue)
    
    if (value == null) {
      this.setState({
        value: inputValue
      })
    } else if (operator) {
      const currentValue = value || 0
      const newValue = CalculatorOperations[operator](currentValue, inputValue)
      
      this.setState({
        value: newValue,
        displayValue: String(newValue)
      })
    }
    
    this.setState({
      waitingForOperand: true,
      operator: nextOperator
    })
  }
  
  handleKeyDown = (event) => {
    let { key } = event
    
    if (key === 'Enter')
      key = '='
    
    if ((/\d/).test(key)) {
      event.preventDefault()
      this.inputDigit(parseInt(key, 10))
    } else if (key in CalculatorOperations) {
      event.preventDefault()
      this.performOperation(key)
    } else if (key === '.') {
      event.preventDefault()
      this.inputDot()
    } else if (key === '%') {
      event.preventDefault()
      this.inputPercent()
    } else if (key === 'Backspace') {
      event.preventDefault()
      this.clearLastChar()
    } else if (key === 'Clear') {
      event.preventDefault()
      
      if (this.state.displayValue !== '0') {
        this.clearDisplay()
      } else {
        this.clearAll()
      }
    }
  };
  
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }
  
  render() {
    const { displayValue } = this.state
    
    const clearDisplay = displayValue !== '0'
    const clearText = clearDisplay ? 'C' : 'AC'
    
    return (
      <div className="calculator">
        <Display value={displayValue}/>
        <div className="calculator-keypad">
          <div className="input-keys">
            <div className="function-keys">
              <Key className="key-clear" onPress={() => clearDisplay ? this.clearDisplay() : this.clearAll()}>{clearText}</Key>
              <Key className="key-sign" onPress={() => this.toggleSign()}>±</Key>
              <Key className="key-percent" onPress={() => this.inputPercent()}>%</Key>
            </div>
            <div className="digit-keys">
              <Key className="key-0" onPress={() => this.inputDigit(0)}>0</Key>
              <Key className="key-dot" onPress={() => this.inputDot()}>●</Key>
              <Key className="key-1" onPress={() => this.inputDigit(1)}>1</Key>
              <Key className="key-2" onPress={() => this.inputDigit(2)}>2</Key>
              <Key className="key-3" onPress={() => this.inputDigit(3)}>3</Key>
              <Key className="key-4" onPress={() => this.inputDigit(4)}>4</Key>
              <Key className="key-5" onPress={() => this.inputDigit(5)}>5</Key>
              <Key className="key-6" onPress={() => this.inputDigit(6)}>6</Key>
              <Key className="key-7" onPress={() => this.inputDigit(7)}>7</Key>
              <Key className="key-8" onPress={() => this.inputDigit(8)}>8</Key>
              <Key className="key-9" onPress={() => this.inputDigit(9)}>9</Key>
            </div>
          </div>
          <div className="operator-keys">
            <Key className="key-divide" onPress={() => this.performOperation('/')}>÷</Key>
            <Key className="key-multiply" onPress={() => this.performOperation('*')}>×</Key>
            <Key className="key-subtract" onPress={() => this.performOperation('-')}>−</Key>
            <Key className="key-add" onPress={() => this.performOperation('+')}>+</Key>
            <Key className="key-equals" onPress={() => this.performOperation('=')}>=</Key>
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <Calculator/>,
  document.getElementById('app')
)