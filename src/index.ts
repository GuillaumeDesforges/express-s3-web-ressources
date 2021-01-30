import express from "express";
import { gql, GraphQLClient, request } from "graphql-request";
import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "./s3";
import {
  S3_BUCKET,
  GQL_API_URL,
  GQL_HEADERS,
  PORT,
  UPLOAD_PASSWORD,
} from "./settings";

// Common

const gqlClient = new GraphQLClient(GQL_API_URL, {
  headers: { ...GQL_HEADERS },
});

const app = express();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

// Add a file

const addFileMutation = gql`
  mutation addFile($s3_path: String!) {
    insert_files_one(object: { s3_path: $s3_path }) {
      id
    }
  }
`;

app.post(
  "/",
  (req, res, next) => {
    const authHeader = req.headers["upload-password"];
    if (authHeader !== UPLOAD_PASSWORD) {
      return next("Bad header 'Upload-Password'");
    }
    next();
    console.log("Authorization ok for client ip=" + req.ip);
  },
  upload.single("file"),
  async (req, res) => {
    const file_s3_key: string = (req.file as any).key;
    console.log(
      "Creating file entry for file originalname=" +
        req.file.originalname +
        ";key=" +
        file_s3_key +
        " ip=" +
        req.ip
    );
    const { insert_files_one: file } = await gqlClient.request(
      addFileMutation,
      {
        s3_path: file_s3_key,
      }
    );
    console.log(
      "Successfully created entry for file originalname=" +
        req.file.originalname +
        ";key=" +
        file_s3_key +
        " ip=" +
        req.ip
    );
    res.send(file);
  }
);

// Get a file

const getFileQuery = gql`
  query getFile($id: uuid!) {
    files_by_pk(id: $id) {
      id
      s3_path
    }
  }
`;

app.get("/:id", async (req, res) => {
  const {
    files_by_pk: { s3_path },
  } = await gqlClient.request(getFileQuery, { id: req.params.id });
  // send file
  s3.getObject({ Bucket: S3_BUCKET, Key: s3_path })
    .createReadStream()
    .pipe(res);
});

app.listen(PORT);
