import React from 'react';
import './App.css';
import {randomString} from "./utils/random";
import axios from "axios";
import {Promise as reject, resolve} from "q";
import {formatNum} from "./utils/formatNum";

class YppUpload extends React.Component{

  constructor(props) {
    super(props);
    this.state={
      refRandom:randomString(32),//唯一性
      width:this.props.width?this.props.width:'100px',//宽
      height:this.props.height?this.props.height:'100px',//高
      url:this.props.url?this.props.url:'http://personalapi.ypp123.com/personal-encapsulation/upload/uploadImage',//url
      maxLength:this.props.maxLength?this.props.maxLength:3,//最大上传个数
      originArr:this.props.originArr?this.props.originArr:[],//原始图数组
      percent:0,
    }
  }

  clickUpload=()=>{
    this.refs['upload'+this.state.refRandom].click();
  }

  upload=()=>{
    let filesArr = this.refs['upload'+this.state.refRandom].files
    let originArr = this.state.originArr
    let existLength = this.state.maxLength - originArr.length//剩余可上传的个数
    if(filesArr.length > 0){
      if(existLength < filesArr.length){
        alert('最多还能上传'+existLength+'张图片')
      }else{
        this.setState({filesArr})
        for(let a = 0;a<filesArr.length;a++){
          this.setState({percent:0})
          let formData = new FormData();
          formData.append('file'+a,filesArr[a])
          axios({
            url: this.state.url,
            method: 'post',
            data: formData,
            onUploadProgress:(progressEvent)=>{ //原生获取上传进度的事件
              if(progressEvent.lengthComputable){
                //属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
                //如果lengthComputable为false，就获取不到progressEvent.total和progressEvent.loaded
                //callback1(progressEvent);
                resolve(progressEvent).then((r)=>{
                  //console.log(r)
                  let percent = formatNum((Number(r.loaded)/Number(r.total))*100)
                  //console.log(percent);
                  this.setState({percent})
                })
              }
            },
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then( (response) => {
            resolve(response.data).then((res)=>{
              let image = res.data.images[0]
              originArr.push(image)
              this.refs['upload'+this.state.refRandom].value = ''        //解决 input 上传第二次不能选择同一文件
              this.setState({originArr,percent:0})
            })
          })
              .catch( (error) => {
                reject(error).then((err)=>{
                  alert(err.msg)
                })
              });

        }
      }
    }else{
      alert('取消上传')
    }
  }

  del=(index)=>{
    let originArr = this.state.originArr
    originArr.splice(index,1)
    this.setState({originArr})
  }

  renUploadDiv=()=>{
    const {width,height,percent} = this.state
    //console.log(percent)
    return(
        <div style={{width,height,border:'1px solid #ececec',cursor:'pointer'}} onClick={this.clickUpload}>
          <div style={{textAlign:'center',fontSize:14,color:'#999',lineHeight:height}}>{percent === 0 ? '点击上传':percent+'%'}</div>
        </div>
    )
  }

  render(){
    const {refRandom,width,height,maxLength,originArr} = this.state
    return(
        <div style={{padding:'20px'}}>
          <div style={{display:'flex',flexDirection:'row'}}>
            {originArr.map((item,index)=>{
              return(
                  <div key={index} style={{marginRight:'20px',width,height,lineHeight:height,border:'1px solid #ececec',position:'relative',cursor:'pointer'}}>
                    <img src={originArr[index].smallImage} alt=""
                         style={{
                           maxWidth:width,
                           maxHeight:height,
                           position:'absolute',
                           top:0,
                           left:0,
                           bottom:0,
                           right:0,
                           margin:'auto',
                           overFlow:'hidden',
                         }}/>
                    <div onClick={()=>{this.del(index)}} style={{position:'absolute',width:'20px',height:'20px',fontWeight:'bold',fontSize:'16px',color:'#fff',background:'deeppink',borderRadius:'50%',lineHeight:'20px',textAlign:'center',right:'-10px',top:'-10px'}}>
                      <span>X</span>
                    </div>
                  </div>
              )
            })}
            {maxLength > originArr.length ?this.renUploadDiv():''}
            <input type="file" multiple onChange={this.upload} hidden ref={'upload'+refRandom} accept="image/*"/>
          </div>
        </div>
    )
  }
}

export default YppUpload;
