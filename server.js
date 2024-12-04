const express = require('express');
const bodyParser = require('body-parser');
const soap = require('soap');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Permite solicitudes desde cualquier origen
app.use(bodyParser.raw({ type: () => true, limit: '5mb' }));

// Define el servicio SOAP
const service = {
    MyService: {
        MyPort: {
            sayHello: function (args) {
                return { greeting: `Hello, ${args.name}` };
            },
        },
    },
};

// Define el WSDL
const xml = `
    <definitions name="MyService"
        targetNamespace="http://www.example.org/MyService/"
        xmlns="http://schemas.xmlsoap.org/wsdl/"
        xmlns:tns="http://www.example.org/MyService/"
        xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        <message name="sayHelloRequest">
            <part name="name" type="xsd:string" />
        </message>
        <message name="sayHelloResponse">
            <part name="greeting" type="xsd:string" />
        </message>
        <portType name="MyPortType">
            <operation name="sayHello">
                <input message="tns:sayHelloRequest" />
                <output message="tns:sayHelloResponse" />
            </operation>
        </portType>
        <binding name="MyBinding" type="tns:MyPortType">
            <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http" />
            <operation name="sayHello">
                <soap:operation soapAction="http://www.example.org/MyService/sayHello" />
                <input>
                    <soap:body use="literal" />
                </input>
                <output>
                    <soap:body use="literal" />
                </output>
            </operation>
        </binding>
        <service name="MyService">
            <port name="MyPort" binding="tns:MyBinding">
                <soap:address location="http://localhost:${port}/wsdl" />
            </port>
        </service>
    </definitions>
`;

// Crea el servidor SOAP
app.listen(port, () => {
    soap.listen(app, '/wsdl', service, xml);
    console.log(`SOAP service running at http://localhost:${port}/wsdl`);
});
