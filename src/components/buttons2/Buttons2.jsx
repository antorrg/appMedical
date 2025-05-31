import React from "react";

const Buttons2 = ({onClick1, style1, text1, onClick2, style2, text2}) => {
  return (
    <div className="d-flex gap-2 mt-2 mt-md-0">
      <button
        onClick={onClick1}
        className={style1}
      >
        {text1}
      </button>
      <button
        onClick={onClick2}
        className={style2}
      >
        {text2}
      </button>
    </div>
  );
};

export default Buttons2;
