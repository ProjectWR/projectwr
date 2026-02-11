import PropTypes from "prop-types";
import BinderNode from "./BinderNode";
import { getOrInitLibraryYTree } from "../../../lib/ytree";

const BinderView = ({ libraryId }) => {
  const ytree = getOrInitLibraryYTree(libraryId);

  // Get root children directly
  const rootChildren = ytree.getNodeChildrenFromKey("root");

  return (
    <div className="p-2 flex flex-col gap-1">
      {ytree.sortChildrenByOrder(rootChildren, "root").map((childId) => (
        <BinderNode
          key={`compile_manuscript-${childId}`}
          ytree={ytree}
          itemId={childId}
          libraryId={libraryId}
          depth={0}
        />
      ))}
    </div>
  );
};

export default BinderView;

BinderView.propTypes = {
  libraryId: PropTypes.string.isRequired,
};
