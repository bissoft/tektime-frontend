import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ReactQuill from "react-quill";

function ModalEditor(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          style={{
            height: "300px",
          }}
        >
          <ReactQuill
            className="h-75"
            value={props.defaultValue}
            onChange={(value) => {
              props.onChange(value);
            }}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Cloturer</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalEditor;
