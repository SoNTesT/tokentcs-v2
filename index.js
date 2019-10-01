import React, { Component } from 'react';
import { render } from 'react-dom';
import Select from 'react-select'
import cn from 'classnames'
import shajs from 'sha.js'
import './style.css';


document.title = "Token";


(function() {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '/favicon.ico';
    document.getElementsByTagName('head')[0].appendChild(link);
})();

// Свойства JSON которые необходимо исключить для формирования токена
const ignoredValues = [
  { value: 'DATA', label: 'DATA' },
  { value: 'Receipt', label: 'Receipt' },
  { value: 'receipt', label: 'receipt' },
  { value: 'Shops', label: 'Shops' },
  { value: 'Token', label: 'Token' },
  { value: 'Data', label: 'Data' },
  { value: 'DigestValue', label: 'DigestValue' },
  { value: 'SignatureValue', label: 'SignatureValue' },
  { value: 'X509SerialNumber', label: 'X509SerialNumber' },

]
const example = `{
   "TerminalKey": "15180119216597",
   "PaymentId": "5353155",
   "Amount": "851500",
   "Receipt": {
      "Email": "ermilove78@mail.ru",
      "Taxation": "osn",
      "Items": [
         {
            "Name": "Футболка-поло с золотистым воротничком",
            "Price": "728000",
            "Quantity": "1",
            "Amount": "364000",
            "Tax": "vat18"
         }
      ]
   }
}`

class App extends Component {
  state = {
    textAreaData: '',
    token: '',
    password: '',
    request: '',
    ignoredValues: [...ignoredValues]
  }

  render() {
    const { token, concString, request } = this.state
    return (
      <div className={'container'}>
        <p className={'example'}>
          {example}
        </p>
        <div className={'selectWrapper'}>
          <span className={'selectTitle'}>Ignored Props:</span>
          <Select isMulti defaultValue={[...ignoredValues]} options={ignoredValues} onChange={this.onChangeSelect}></Select>
        </div>

        <textarea
          onChange={this.onChange}
          value={this.state.textAreaData}
          className={'textarea'}
          placeholder={'JSON'}>
        </textarea>
        <input placeholder={'Password'} onChange={this.onChangePassword} type={'text'} className={'password'} value={this.state.password} />
        <button
          className={'button'}
          onClick={this.onClickGetData}>
          Get token data
          </button>
        {token ? <span className={'fieldTitle'}>Token (SHA):</span> : null}
        {token ? <p className={'output'}>{this.state.token}</p> : null}
        {concString ? <span className={'fieldTitle'}>Concatenated Props:</span> : null}
        {concString ? <p className={'output'}>{this.state.concString}</p> : null}
        {request ? <span className={'fieldTitle'}>Request Object:</span> : null}
        {request ? <pre className={'requestOutput'} >{JSON.stringify(this.state.request, undefined, 2)}</pre> : null}
      </div >
    );
  }

  onChangePassword = (e) => {
    this.setState({ password: e.currentTarget.value })
  }

  onChange = (e) => {
    this.setState({ textAreaData: e.currentTarget.value })
  }

  onClickGetData = () => {
    if (!this.state.textAreaData) {
      return
    }
    try {
      const json = JSON.parse(this.state.textAreaData);
      const data = this.getData(json);
      const concString = data.str
      const token = data.sha
      const request = this.getRequest(json, token)
      this.setState({ concString, token, request })
    }
    catch (error) {
      return this.setState({ genData: `Ошибка: ${error.message}` })
    }

  }

  onChangeSelect = (ignoredValues) => {
    this.setState({ ignoredValues })
  }

  getData = json => {
    const { ignoredValues } = this.state;
    const formattedIgnoredValues = ignoredValues.map(ignoredValue => ignoredValue.value)
    const jsonWithPassword = { ...json, Password: this.state.password }
    const filteredData = filterDataByIgnoredValues(jsonWithPassword, formattedIgnoredValues)
    const sortedData = sortObjPropsAlphabetically(filteredData)
    const concatenatedStr = concatObjProps(sortedData)
    const sha = shajs('sha256').update(concatenatedStr).digest('hex')
    return { str: concatenatedStr, sha, filteredData };
  };

  getRequest = (json, token) => {
    return { ...json, Token: token }
  };
}

function filterDataByIgnoredValues(reqObj, ignoredValues) {
  let filteredData = {};
  for (let prop in reqObj) {
    if (reqObj[prop] !== '') {
      if (!ignoredValues.includes(prop)) {
        filteredData[prop] = reqObj[prop]
      }
    }
  }
  return filteredData;
}


function sortObjPropsAlphabetically(obj) {
  const sortedProps = Object.keys(obj).slice().sort();
  return sortedProps.reduce((sortedObj, prop) => {
    return { ...sortedObj, [prop]: obj[prop] }
  }, {})
}

function concatObjProps(obj) {
  const props = Object.keys(obj);
  return props.reduce((concatenatedStr, prop) => `${concatenatedStr}${obj[prop]}`, '')
}
render(<App />, document.getElementById('root'));
