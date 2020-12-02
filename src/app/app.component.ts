import { Component } from '@angular/core';
import { Message } from './shared/message.model';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray} from '@angular/forms';

interface httpResp {
    block: boolean;
    reason: string[];
    user_message: string;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'chat-demo';
  messages = [];

  onEnter(value: string){
    if(value){
      this.postRequest(value)
    }
  }

  form: FormGroup;
  filters: any = [
    {id: 1, name: 'Toxic'},
    {id: 2, name: 'Severe Toxic'},
    {id: 3, name: 'Obscene'},
    {id: 4, name: 'Threat'},
    {id: 5, name: 'Insult'},
    {id: 6, name: 'Identity Hate'}
  ];
  //checkboxes = [{'name':'checkbox1',checked:false},{'name':'checkbox2',checked:false}];

  constructor(private formBuilder: FormBuilder){
    this.form = this.formBuilder.group({
      filts: this.formBuilder.array([], [Validators.required])
    })
  }

  onCheckboxChange(e){
    const filts: FormArray = this.form.get('filts') as FormArray;

    if(e.target.checked){
      filts.push(new FormControl(e.target.value));

    }else{
      const indx = filts.controls.findIndex(x => x.value === e.target.value);
      filts.removeAt(indx);
    }
  }

  submit(){
    console.log(this.form.value);
  }


//POST REQUEST
  postRequest(value: string){
    //const sendData = { filters: ['Obscene','Insult'], text: value };
    const sendData = { filters: ['Obscene','Insult'], text: value };
    //JSON POST request
    fetch('http://localhost:5000/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',},
      body: JSON.stringify(sendData),
    })
    .then((response) => response.json())
    //Runs successfully
    .then((data) => {
      console.log('Success:', data);
      let resp : httpResp = data;
      if(resp.block == false){
        this.messages.push(new Message(value))
      }else{
        this.messages.push(new Message('(This message was blocked due to filter settings. Reason: '+ resp.reason + ')'))
      }
    })
    //Runs into an error...
    .catch((error) => {
      console.error('Error:', error);
      this.messages.push(new Message('(ERROR: Message cannot be sent)'))
    });
  }



}
