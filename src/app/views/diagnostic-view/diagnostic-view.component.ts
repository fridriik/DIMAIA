import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Diagnostic } from 'src/app/models/Diagnostic';
import { Doctor } from 'src/app/models/Doctor';
import { ResultService } from 'src/app/services/result/result.service';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-diagnostic-view',
  templateUrl: './diagnostic-view.component.html',
  styleUrls: ['./diagnostic-view.component.css'],
  providers: [MessageService],
})
export class DiagnosticViewComponent implements OnInit {
  doctor!: Doctor;
  diagnostic!: Diagnostic;
  isValid=false;
  formFieldsCompleted = false;
  formFieldsError = false;
  uploadedFile: File | null = null;
  isResultButtonDisabled = true;
  imagenURL: string | ArrayBuffer | null = null;
  showCancelButton = false;
  maxFileSize: number = 10485760;
  minImageWidth: number = 225;
  minImageHeight: number = 225;
  acceptedFileTypes: string = 'image/jpeg,image/png,application/dicom';
  sexOptions: { label: string; value: string; }[] | undefined;
  partsOptions: { label: string; value: string; }[] | undefined;
  calendarIcon = 'pi pi-calendar';
  dateUser: Date[] | undefined;
  minValidDate!: Date;
  maxValidDate!: Date;

  constructor(private resultService: ResultService,private messageService: MessageService, private router: Router) { }

  ngOnInit(): void {
    this.sexOptions = [
      { label: 'Masculino', value: 'Masculino' },
      { label: 'Femenino', value: 'Femenino' }
    ];

    this.partsOptions = [
      { label: 'Cerebro', value: '1' },
      { label: 'Corazon', value: '2' },
    ];

    this.diagnostic = new Diagnostic();
    this.doctor = new Doctor();

    const today = new Date();
    this.minValidDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    this.maxValidDate = today;
  }

  onFileSelect(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const image = new Image();
      image.src = window.URL.createObjectURL(selectedFile);

      image.onload = () => {
        if (
          selectedFile.size <= this.maxFileSize &&
          this.acceptedFileTypes.split(',').includes(selectedFile.type) &&
          image.width >= this.minImageWidth &&
          image.height >= this.minImageHeight
        ) {
          this.uploadedFile = selectedFile;
          this.isResultButtonDisabled = false;
          this.getObjectURL(selectedFile);
          this.showCancelButton = true; // Muestra el botón de cancelar
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'La imagen no cumple con los requisitos',
            life: 2000,
          });
          this.resetFileInput();
        }
      };
    } else {
      this.resetFileInput();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha seleccionado una imagen o ocurrió un error al subir el archivo.',
        life: 3000,
      });
    }
  }

  resetFileInput() {
    this.uploadedFile = null;
    this.isResultButtonDisabled = true;
    this.imagenURL = null;
  }
  cancelImageUpload() {
    this.resetFileInput();
    this.showCancelButton = false; // Oculta el botón de cancelar
  }

  getObjectURL(file: File) {
    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (event) => {
        this.imagenURL = event.target?.result as string;
      };
    }
  }

  diagnosticResult() {
    this.checkFormFields();
    this.checkFormErrorFields();
    console.log(this.formFieldsCompleted);
    console.log(this.formFieldsError);
    if (this.uploadedFile && this.formFieldsCompleted && this.formFieldsError) {
      this.postResult(this.uploadedFile);
    } else {
      if (!this.uploadedFile) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se ha seleccionado una imagen.',
          life: 2000,
        });
      }

      if (!this.formFieldsCompleted) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Completa todos los campos del formulario antes de continuar',
          life: 2000,
        });
      }
      else if (!this.formFieldsError){
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Datos del formulario erroneos',
          life: 2000,
        });
      }
    }
  }

  postResult(file: File) {

    const req=this.createRequestHeart(file,1,1);
    console.log(req);
    this.resultService.postResultHeart(req).subscribe({
      next: (res) => {
        console.log(res);
        localStorage.setItem('PredictedResult', JSON.stringify(res));
        this.router.navigate(['/result']);
      },
      error: (error) => {
        // Manejar errores aquí
      }
    });

    const reqBrain=this.createRequestBrain(file,true,true,true,4,4);

    this.resultService.postResultBrain(reqBrain).subscribe({
      next: (res) => {
        console.log(res);
        localStorage.setItem('PredictedResultbrain', JSON.stringify(res));
      },
      error: (error) => {
        // Manejar errores aquí
      }
    });

    const reqLungs=this.createRequestLungs(file,true,true,true,4,4);

    this.resultService.postResultLungs(reqLungs).subscribe({
      next: (res) => {
        console.log(res);
        localStorage.setItem('PredictedResult', JSON.stringify(res));
        this.router.navigate(['/result']);
      },
      error: (error) => {
        // Manejar errores aquí
      }
    });

  }

  OnSelectedSex(event : any) {

  }

  OnSelectedPart(event : any) {

  }

  private createRequestBrain(imagen: File,
    perdida_visual:boolean,debilidad_focal:boolean,convulsiones:boolean,
    id_usuario:number,id_medico:number):FormData {
    const formData = new FormData();
    formData.append('imagen', imagen);
    formData.append('perdida_visual', `${perdida_visual}`);
    formData.append('debilidad_focal', `${debilidad_focal}`);
    formData.append('convulsiones', `${convulsiones}`);
    formData.append('id_usuario', `${id_usuario}`);
    formData.append('dni_medico', `${id_medico}`);
    return formData;
  }

  private createRequestLungs(imagen: File,
    puntadaLateral: boolean, fiebre: boolean, dificultadRespiratoria: boolean,
    idUsuario: number, idMedico: number):FormData  {
    const formData = new FormData();
    formData.append('imagen', imagen);
    formData.append('puntada_lateral', `${puntadaLateral}`);
    formData.append('fiebre', `${fiebre}`);
    formData.append('dificultad_respiratoria', `${dificultadRespiratoria}`);
    formData.append('id_usuario', `${idUsuario}`);
    formData.append('dni_medico', `${idMedico}`);
    return formData;
}
private createRequestHeart(imagen: File,idUsuario: number,
  idMedico: number) :FormData{
  const formData = new FormData();
  formData.append('imagen', imagen);
  formData.append('id_usuario', `${idUsuario}`);
  formData.append('dni_medico', `${idMedico}`);
  return formData;
}

  checkFormFields() {
    if (
      this.doctor.dni != undefined &&
      this.doctor.name != undefined&&
      this.doctor.lastname != undefined&&
      this.diagnostic.weight != undefined&&
      this.diagnostic.height != undefined&&
      this.diagnostic.gender != undefined&&
      this.diagnostic.sectionBody != undefined
    ) {
      this.formFieldsCompleted = true;
    } else {
      this.formFieldsCompleted = false;
    }
  }
  checkFormErrorFields() {
    const dniPattern = /^[0-9]{7,8}$/;

    const validDNI = this.doctor?.dni && dniPattern.test(this.doctor.dni.toString()); // Validar el DNI

    const validName = this.doctor?.name && typeof this.doctor.name === 'string' && this.doctor.name.length >= 2;
    const validLastName = this.doctor?.lastname && typeof this.doctor.lastname === 'string' && this.doctor.lastname.length >= 2;

    const validWeight = this.diagnostic?.weight && typeof this.diagnostic.weight === 'number' && this.diagnostic.weight >= 1 && this.diagnostic.weight <= 200;
    const validHeight = this.diagnostic?.height && typeof this.diagnostic.height === 'number' && this.diagnostic.height >= 25 && this.diagnostic.height <= 230;


    if (validDNI && validName && validLastName && validWeight && validHeight) {
      this.formFieldsError = true;
    } else {
      console.log(this.diagnostic);
      console.log(this.doctor);
      this.formFieldsError = false;
    }
  }

  tituloDinamico = 'Diagnostico';
    cambiarTitulo(nuevoTitulo: string) {
    this.tituloDinamico = nuevoTitulo;
  }
}

