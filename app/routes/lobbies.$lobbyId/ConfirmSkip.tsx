type ConfirmSkipProps = {
  modalRef: React.RefObject<HTMLDialogElement>;
  username: string;
  onConfirm: () => void;
};

const ConfirmSkip = ({ modalRef, username, onConfirm }: ConfirmSkipProps) => (
  <dialog ref={modalRef} className="modal">
    <div className="modal-box">
      <h3 className="font-bold text-lg">Stop waiting for {username}?</h3>
      <p className="py-4">
        Their picks will be made at random until they come back.
      </p>
      <form method="dialog" className="modal-action">
        <button className="btn">Keep waiting</button>
        <button className="btn btn-warning" onClick={onConfirm}>
          Skip the wait
        </button>
      </form>
    </div>
  </dialog>
);

export default ConfirmSkip;
