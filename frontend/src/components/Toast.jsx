export default function Toast({ kind="ok", message="", onClose }) {
  if (!message) return null;
  const bg = kind === "error" ? "#fee2e2" : "#dcfce7";
  const fg = kind === "error" ? "#991b1b" : "#166534";
  return (
    <div style={{
      position:"fixed", right:16, bottom:16, background:bg, color:fg,
      padding:"10px 12px", borderRadius:10, boxShadow:"0 10px 30px rgba(0,0,0,.2)", zIndex:50
    }}
      onClick={onClose}
      title="Fechar"
    >
      {message}
    </div>
  );
}

