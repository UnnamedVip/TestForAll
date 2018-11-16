import { Component, OnInit } from '@angular/core';
//import { GetjsondatafromfileService } from '../services/getjsondatafromfile.service';
import { GridOptions } from 'ag-grid-community';

//#region variables for plugin
var CADES_BES = 1;
var CADESCOM_CADES_BES = 1;
var CAPICOM_CURRENT_USER_STORE = 2;
var CAPICOM_MY_STORE = "My";
var CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;
var CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME = 1;
var CADESCOM_BASE64_TO_BINARY = 1;
var CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME = 0;
var CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME = 1;
var global_selectbox_container = new Array();
var global_isFromCont = new Array();
var fileContent;
declare var cadesplugin: any;
//#endregion for plugin


@Component({
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css']
})
export class FirstComponent implements OnInit {

  //#region GRID test:

  /* constructor(private dataService: GetjsondatafromfileService) {}

  private gridOptions: GridOptions;

  rowData: any;

  columnDefs: [
    { headerName: 'Name', field: 'name' },
    { headerName: 'Age', field: 'age' },
    { headerName: 'Country', field: 'country' },
    { headerName: 'Telephone', field: 'telephoneNumber' }
  ]

  
  ngOnInit() {

    this.gridOptions = <GridOptions>{
      onCellClicked: (event) => {
        console.log(event);
      },
      enableSorting: true,
      rowSelection: "multiple",
      enableFilter: true,
      defaultColDef: {
        editable: true,
      }
    };

    this.gridOptions.columnDefs = [
      {
        headerName: 'Name',
        field: 'name',
        checkboxSelection: true
      },
      {
        headerName: 'Age',
        field: 'age'
      },
      {
        headerName: 'Country',
        field: 'country'
      },
      {
        headerName: 'Telephone',
        field: 'telephoneNumber'
      }
    ];

    //this.gridOptions.enableSorting = true;
    //this.gridOptions.rowSelection = "multiple";
    //this.gridOptions.enableFilter = true; 

    this.dataService.getDataFromFile().subscribe(data => {
      console.log(data);
      this.rowData = data;
      this.gridOptions.api.setRowData(this.rowData);
    });
  } */

  //#endregion GRID test:

  //#region plugin test:

  constructor() {

  }

  ngOnInit() {
    //plugin
    cadesplugin.then(() => {
      this.FillCertList_Async('certlist');
    }).catch(() => {
      console.log('Ошибка загрузки плагина', 'Проверьте настройки');
    });
  }

  fileToUpload: File = null;
  planId: number;
  key: string;
  uploading: boolean;

  FillCertList_Async(lstId) {
    cadesplugin.async_spawn(function* () {
      var myStoreExists = true;
      try {
        var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
        if (!oStore) {
          this._noty.showError('Ошибка загрузки хранилища', 'Проверьте настройки');
          return;
        }

        yield oStore.Open();
      }
      catch (ex) {
        myStoreExists = false;
      }

      var lst = document.getElementById(lstId); //id="certlist"
      if (!lst) {
        return;
      }
      lst.onchange = onCertificateSelected;
      lst['boxId'] = lstId;

      var certCnt;
      var certs;
      var global_selectbox_counter = 0;

      var global_isFromCont = new Array();

      if (myStoreExists) {
        try {
          certs = yield oStore.Certificates;
          certCnt = yield certs.Count;
        }
        catch (ex) {
          console.log("Ошибка работы плагина для подписи", "Ошибка при получении Certificates или Count: " + cadesplugin.getLastError(ex));
          return;
        }
        for (var i = 1; i <= certCnt; i++) {
          var cert;
          try {
            cert = yield certs.Item(i);
          }
          catch (ex) {
            console.log("Ошибка работы плагина для подписи", "Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
            return;
          }

          var oOpt = document.createElement("OPTION");
          try {
            var validFromDate = new Date((yield cert.ValidFromDate));
            oOpt['text'] = new CertificateAdjuster().GetCertInfoString(yield cert.SubjectName, validFromDate);
          }
          catch (ex) {
            console.log("Ошибка работы плагина для подписи", "Ошибка при получении свойства SubjectName: " + cadesplugin.getLastError(ex));
          }
          try {
            oOpt['value'] = yield cert.Thumbprint;
            oOpt['value'] = global_selectbox_counter
            global_selectbox_container.push(cert);
            global_isFromCont.push(false);
            global_selectbox_counter++;
          }
          catch (ex) {
            console.log("Ошибка работы плагина для подписи", "Ошибка при получении свойства Thumbprint: " + cadesplugin.getLastError(ex));
          }
          lst['options'].add(oOpt);
        }
        yield oStore.Close();
      }
    });//cadesplugin.async_spawn
  }


  SignCreate(certSubjectName, dataToSign) {
    var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
    oStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE,
      CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);

    var oCertificates = oStore.Certificates.Find(
      CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME, certSubjectName);
    if (oCertificates.Count == 0) {
      //this._noty.showError("Ошибка", "Сертификат не найдет: " + certSubjectName);
      console.log("Ошибка", "Сертификат не найдет: " + certSubjectName);
      return;
    }
    var oCertificate = oCertificates.Item(1);
    var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    oSigner.Certificate = oCertificate;

    var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
    oSignedData.ContentEncoding = CADESCOM_BASE64_TO_BINARY;
    oSignedData.Content = dataToSign;

    try {
      var sSignedMessage = oSignedData.SignCades(oSigner, CADESCOM_CADES_BES, true);
    } catch (err) {
      var errStr = "Ошибка создания подписи: " + cadesplugin.getLastError(err);
      //this._noty.showError("Ошибка работы плагина для подписи", errStr);
      console.log("Ошибка работы плагина для подписи", errStr);
      return;
    }

    oStore.Close();

    return sSignedMessage;
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    console.log(files.item(0).name);
  }

  uploadFile() {

    if (!this.fileToUpload) {
      //this._noty.showError('Ошибка загрузки хранилища', 'Проверьте настройки');
      console.log('Ошибка загрузки хранилища', 'Проверьте настройки');

    }

    this.key = '';
    var oFile = this.fileToUpload;
    var oFReader = new FileReader();

    oFReader.readAsDataURL(oFile);

    oFReader.onload = function (oFREvent) {
      var header = ";base64,";
      var sFileData = oFREvent['target']['result'];
      fileContent = sFileData.substr(sFileData.indexOf(header) + header.length);
    }

    this.SignCadesBES_Async_File('certlist').then((value: any) => {
      this.key = value;
      this.uploading = true;
      console.log('SignCadesBES_Async_File ', value);
    })
  }

  SignCadesBES_Async_File(certListBoxId) {
    return new Promise(function (resolve, reject) {
      cadesplugin.async_spawn(function* (args) {
        var e = document.getElementById(args[0]);
        var selectedCertID = e['selectedIndex'];
        if (selectedCertID == -1) {
          args[2]("Необходимо выбрать сертификат");
          return;
        }
        var certificate = global_selectbox_container[selectedCertID];
        var signature;
        try {
          var errormes = "";
          try {
            var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
          } catch (err) {
            errormes = "Ошибка создания CAdESCOM.CPSigner: " + err.number;
            throw errormes;
          }
          var oSigningTimeAttr = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");


          yield oSigningTimeAttr.propset_Name(CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME);
          var oTimeNow = new Date();
          yield oSigningTimeAttr.propset_Value(oTimeNow);
          var attr = yield oSigner.AuthenticatedAttributes2;
          yield attr.Add(oSigningTimeAttr);

          var oDocumentNameAttr = yield cadesplugin.CreateObjectAsync("CADESCOM.CPAttribute");
          yield oDocumentNameAttr.propset_Name(CADESCOM_AUTHENTICATED_ATTRIBUTE_DOCUMENT_NAME);
          yield oDocumentNameAttr.propset_Value("Document Name");
          yield attr.Add(oDocumentNameAttr);

          if (oSigner) {
            yield oSigner.propset_Certificate(certificate);
          }
          else {
            errormes = "Ошибка создания CAdESCOM.CPSigner";
            throw errormes;
          }

          var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");

          var dataToSign = fileContent;
          if (dataToSign) {
            // Данные на подпись ввели
            yield oSignedData.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
            yield oSignedData.propset_Content(dataToSign);
            yield oSigner.propset_Options(1);
            try {
              var startTime = Date.now();
              signature = yield oSignedData.SignCades(oSigner, CADES_BES);
              var endTime = Date.now();
              console.log("Время выполнения: " + (endTime - startTime) + " мс");
            }
            catch (err) {
              errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
              throw errormes;
            }
          }
          console.log("Подпись сформирована");
          args[1](signature);
        }
        catch (err) {
          args[2](err);
        }
      }, certListBoxId, resolve, reject); //cadesplugin.async_spawn
    });
  }
} // end class

function CertificateAdjuster() {
}

CertificateAdjuster.prototype.extract = function (from, what) {
  var certName = "";

  var begin = from.indexOf(what);

  if (begin >= 0) {
    var end = from.indexOf(', ', begin);
    certName = (end < 0) ? from.substr(begin) : from.substr(begin, end - begin);
  }

  return certName;
};

CertificateAdjuster.prototype.Print2Digit = function (digit) {
  return (digit < 10) ? "0" + digit : digit;
};

CertificateAdjuster.prototype.GetCertDate = function (paramDate) {
  var certDate = new Date(paramDate);
  return this.Print2Digit(certDate.getUTCDate()) + "." + this.Print2Digit(certDate.getMonth() + 1) + "." + certDate.getFullYear() + " " +
    this.Print2Digit(certDate.getUTCHours()) + ":" + this.Print2Digit(certDate.getUTCMinutes()) + ":" + this.Print2Digit(certDate.getUTCSeconds());
};

CertificateAdjuster.prototype.GetCertName = function (certSubjectName) {
  return this.extract(certSubjectName, 'CN=');
};

CertificateAdjuster.prototype.GetIssuer = function (certIssuerName) {
  return this.extract(certIssuerName, 'CN=');
};

CertificateAdjuster.prototype.GetCertInfoString = function (certSubjectName, certFromDate) {
  return this.extract(certSubjectName, 'CN=') + "; Выдан: " + this.GetCertDate(certFromDate);
};

function onCertificateSelected(event) {
  cadesplugin.async_spawn(function* (args) {
    var selectedCertID = args[0].selectedIndex;
    var certificate = global_selectbox_container[selectedCertID];
    FillCertInfo_Async(certificate, event.target.boxId, global_isFromCont[selectedCertID]);
  }, event.target);//cadesplugin.async_spawn
}

function FillCertInfo_Async(certificate, certBoxId, isFromContainer) {
  cadesplugin.async_spawn(function* (args) {
    var adjust = new CertificateAdjuster();

    var validToDate = new Date((yield args[0].ValidToDate));
    var validFromDate = new Date((yield args[0].ValidFromDate));
    var validator;
    var isValid = false;
    //если попадется сертификат с неизвестным алгоритмом
    //тут будет исключение. В таком сертификате просто пропускаем такое поле
    try {
      validator = yield args[0].IsValid();
      isValid = yield validator.Result;
    } catch (e) {

    }
    var hasPrivateKey = yield args[0].HasPrivateKey();
    var currentDate = new Date();

    document.getElementById(args[1]).style.display = '';
    document.getElementById(args[1] + "subject").innerHTML = "Владелец: <b>" + adjust.GetCertName(yield args[0].SubjectName) + "<b>";
    document.getElementById(args[1] + "issuer").innerHTML = "Издатель: <b>" + adjust.GetIssuer(yield args[0].IssuerName) + "<b>";
    document.getElementById(args[1] + "from").innerHTML = "Выдан: <b>" + adjust.GetCertDate(validFromDate) + "<b>";
    document.getElementById(args[1] + "till").innerHTML = "Действителен до: <b>" + adjust.GetCertDate(validToDate) + "<b>";
    var pubKey = yield args[0].PublicKey();
    var algo = yield pubKey.Algorithm;
    var fAlgoName = yield algo.FriendlyName;
    document.getElementById(args[1] + "algorithm").innerHTML = "Алгоритм ключа: <b>" + fAlgoName + "<b>";
    if (hasPrivateKey) {
      var oPrivateKey = yield args[0].PrivateKey;
      var sProviderName = yield oPrivateKey.ProviderName;
      document.getElementById(args[1] + "provname").innerHTML = "Криптопровайдер: <b>" + sProviderName + "<b>";
    }
    if (currentDate < validFromDate) {
      document.getElementById(args[1] + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Срок действия не наступил</b></span>";
    } else if (currentDate > validToDate) {
      document.getElementById(args[1] + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Срок действия истек</b></span>";
    } else if (!hasPrivateKey) {
      document.getElementById(args[1] + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Нет привязки к закрытому ключу</b></span>";
    } else if (!isValid) {
      document.getElementById(args[1] + "status").innerHTML = "Статус: <span style=\"color:red; font-weight:bold; font-size:16px\"><b>Ошибка при проверке цепочки сертификатов</b></span>";
    } else {
      document.getElementById(args[1] + "status").innerHTML = "Статус: <b> Действителен<b>";
    }

    if (args[2]) {
      document.getElementById(args[1] + "location").innerHTML = "Установлен в хранилище: <b>Нет</b>";
    } else {
      document.getElementById(args[1] + "location").innerHTML = "Установлен в хранилище: <b>Да</b>";
    }

  }, certificate, certBoxId, isFromContainer);//cadesplugin.async_spawn


  //#endregion plugin test:

}
