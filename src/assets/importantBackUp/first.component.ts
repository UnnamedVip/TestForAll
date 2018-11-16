import { Component, OnInit } from '@angular/core';

//#region variables for plugin
declare var cadesplugin: any;
var certList: any = [];
var global_selectbox_container: any = [];
var selectedCertificateFromList;
var selectedCertificateFromContainer;
var fileContent;
var over:boolean;
//#endregion for plugin


@Component({
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css']
})

export class FirstComponent implements OnInit {

  //используем гетеры для отдачи глобальных перменных лежащих вне класса на форму:
  get certListGet() {
    return certList;
  }

  get fileContentGet() {
    return fileContent;
  }
  
  get overGet() {
    return over;
  }

  //выбранный из списка сертификат, который будет использован для подписи
  get selectedCertificateFromListGet() {
    return selectedCertificateFromList;
  }

  //файл который будет загружен и подписан
  fileToUpload: File = null;
  
  constructor() { }

  ngOnInit() {
    cadesplugin.then(() => {
      cadesplugin.async_spawn(this.FillCertList_Async);
    }).catch(() => {
      console.log('Ошибка загрузки плагина', 'Проверьте настройки');
    });
  }

  //метод который позволяет получить список имеющихся сертификатов: 
  FillCertList_Async = function* () {
    let store = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
    yield store.Open(); //открыли хранилище для просмотра сертификатов
    let certs = yield store.Certificates;
    let certCnt = yield certs.Count;
    if (certCnt) {
      for (var i = 1; i <= certCnt; i++) {
        let cert = yield certs.Item(i);
        global_selectbox_container.push(cert);
        certList.push({
          IssuerName: yield cert.IssuerName,
          //PrivateKey: yield cert.PrivateKey, //нужно проработать отсутствие свойств у сертификата
          SerialNumber: yield cert.SerialNumber,
          SubjectName: yield cert.SubjectName, /*cert.SubjectName.then(data => console.log(data));*/
          SubjeThumbprintctName: yield cert.Thumbprint,
          ValidFromDate: new Date(yield cert.ValidFromDate),
          ValidToDate: new Date(yield cert.ValidToDate),
          ValVersionidToDate: yield cert.Version
        });
      }
      yield store.Close();
    }
    else {
      console.log("Не удалось получиться список сертификатов! строка 71");
    }

  };

  onCertificateSelected(index) {
    selectedCertificateFromList = certList[index];
    selectedCertificateFromContainer = global_selectbox_container[index];
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    console.log(files.item(0).name);
  }

  uploadFile() {
    let fReader = new FileReader();
    fReader.readAsDataURL(this.fileToUpload);
    fReader.onloadend = function () {
      let header = ";base64,";
      let sFileData = fReader.result as String;
      fileContent = sFileData.substr(sFileData.indexOf(header) + header.length);
    };
    //функция генератор которая осуществляет подпись прикрепленного файла:
    cadesplugin.async_spawn(function*() {
      var certificate = selectedCertificateFromContainer;
      var Signature;
      try
      {
          //FillCertInfo_Async(certificate);
          var errormes = "";
          try {
              var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
          } catch (err) {
              errormes = "Failed to create CAdESCOM.CPSigner: " + err.number;
              throw errormes;
          }

          //пример реализации прикрепления информации к подписи oSigningTimeAttr и oDocumentNameAttr:
          var oSigningTimeAttr = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");
          var CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME = 0;
          yield oSigningTimeAttr.propset_Name(CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME);
          var oTimeNow = new Date();
          yield oSigningTimeAttr.propset_Value(oTimeNow);
          var attr = yield oSigner.AuthenticatedAttributes2;
          yield attr.Add(oSigningTimeAttr);


          var oDocumentNameAttr = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");
          var CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME = 1;
          yield oDocumentNameAttr.propset_Name(CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME);
          yield oDocumentNameAttr.propset_Value("Document Name"); //можно вытащить имя загруженного документа и впилить сюда
          yield attr.Add(oDocumentNameAttr);

          if (oSigner) {
              yield oSigner.propset_Certificate(certificate);
          }
          else {
              errormes = "Failed to create CAdESCOM.CPSigner";
              throw errormes;
          }

          var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
          var CADES_BES = 1;

          var dataToSign = fileContent;
          if (dataToSign) {
              // Данные на подпись ввели
              yield oSignedData.propset_ContentEncoding(1); //CADESCOM_BASE64_TO_BINARY
              yield oSignedData.propset_Content(dataToSign);
              yield oSigner.propset_Options(1); //CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN
              try {                 
                  Signature = yield oSignedData.SignCades(oSigner, CADES_BES);                  
              }
              catch (err) {
                  errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
                  throw errormes;
              }
          }
          console.info("Подпись сформирована успешно:", Signature);
          over = true;
      }
      catch(err)
      {
        console.error("Возникла ошибка при формировании подписи", err);
      }
  });
  }
  //#endregion plugin test
  
}
