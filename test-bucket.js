import { ConfigFileAuthenticationDetailsProvider } from "oci-common";
import { ObjectStorageClient } from "oci-objectstorage";

// carrega credenciais de ~/.oci/config, profile DEFAULT
const provider = new ConfigFileAuthenticationDetailsProvider();
const client   = new ObjectStorageClient({ authenticationDetailsProvider: provider });

const namespace = "axcyntfguubc";
const bucket    = "bucket-phldev";

// exemplo: enviar um objeto
const content = Buffer.from("Olá, Oracle!", "utf-8");
await client.putObject({
  namespaceName: namespace,
  bucketName:    bucket,
  objectName:    "teste/hello.txt",
  putObjectBody: content
});
console.log("Arquivo enviado com sucesso!");