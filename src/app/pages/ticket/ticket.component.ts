import { Component, OnInit } from '@angular/core';
//Formularios reactivos
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Ticket } from 'src/app/models/ticket';
import { HardwareService } from 'src/app/services/hardware.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-hardware',
  templateUrl: './hardware.component.html',
  styleUrls: ['./hardware.component.css']
})

export class HardwareComponent implements OnInit {
  form!: FormGroup;
  listOfTicket: Ticket[] = [];
  visible = false;
  accion:boolean=true;
  idModificar:string='';

  constructor(
    private hardwareService: HardwareService,
    private nzMessageService: NzMessageService,
    private formBuilder: FormBuilder
  ) {
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      eventoId: [''],
      fecha: [''],
      hora: [''],
      duracion: [null],
      precio: [''],
      silla: [null]
    });
  }

  ngOnInit(): void {
    this.hardwareService.getAllHardware().toPromise().then(
      (data: Ticket[]) => this.listOfTicket = data
    )
  }

  delete(id: string) {
    this.hardwareService.deleteHardware(id).toPromise().then(() => {
      this.nzMessageService.warning('El registro fue eliminado con exito!');
      this.listOfTicket = this.listOfTicket.filter(x => x.id !== id);
    }, (error) => {
      this.nzMessageService.error('El registro no pudo ser eliminado, por favor intente de nuevo');
      console.error(error);
    })
  }

  cancel(): void {
    this.nzMessageService.info('Su registro sigue activo! =D')
  }

  open(): void {
    this.visible = true;
    this.accion=true;
  }

  close(): void {
    this.visible = false;
    this.buildForm();
  }

  guardar(): void {
    if (this.accion) {
      this.hardwareService.postHardware(this.form.value).toPromise().then((data: any) => {
        //this.listOfHardware.push(data);
        this.nzMessageService.success('El registro fue ingresado con exito!');
        this.listOfTicket = [...this.listOfTicket, data]
        //Limpia el formulario y lo cierra
        this.buildForm();
        this.visible = false;
      }, (error) => {
        this.nzMessageService.error('El registro no pudo ser ingresado, por favor intente de nuevo');
        console.error(error);
      })
    }else{
      this.hardwareService.putHardware(this.idModificar,this.form.value).toPromise().then(()=>{
        for(let elemento of this.listOfTicket.filter(x=>x.id===this.idModificar)){
          elemento.eventoId=this.form.value.eventoId;
          elemento.fecha= this.form.value.fecha;
          elemento.duracion= this.form.value.duracion;
          elemento.precio= this.form.value.precio;
          elemento.silla=this.form.value.silla;
          
        }
        this.visible = false;
        this.nzMessageService.success('El registro fue actualizado con exito!');
      }, (error) => {
        this.nzMessageService.error('El registro no pudo ser actualizado, por favor intente de nuevo');
        console.error(error);
      })
    }
  }

  modificar(item:Ticket):void{
    this.accion=false;
    this.idModificar=item.id;
    this.visible = true;
    this.form=this.formBuilder.group({
      eventoId: [item.eventoId],
      fecha: [item.fecha],
      hora: [item.hora],
      duracion: [item.duracion],
      precio: [item.precio],
      silla: [item.silla]
    })
  }

  submitForm(): void {
    for (const i in this.form?.controls) {
      this.form?.controls[i].markAsDirty();
      this.form?.controls[i].updateValueAndValidity();
    }
  }
}
