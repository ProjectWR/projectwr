import PropTypes from "prop-types";
import dataManager from "../../../../lib/data";
import { sortArrayByOrder } from "../../../../utils/orderUtil";
import DirectoryItemNode from "./DirectoryItemNode";
import useItemEntriesMap from "../../../../hooks/useItemEntriesMap";

const LibraryDirectory = ({ libraryEntryReference, className }) => {
  const itemEntriesMapReference = dataManager.fetchItemsMap(
    libraryEntryReference
  );
  const itemEntriesMapState = useItemEntriesMap(itemEntriesMapReference);

  const booksMapReference = libraryEntryReference.get("books-map");
  console.log("LibraryDirectory: ", libraryEntryReference, booksMapReference);

  return (
    <div
      id="LibraryDirectoryContainer"
      className={`w-full h-full min-h-0 max-h-full flex flex-col items-center justify-center ${className}`}
    >
      <div
        id="libraryDirectoryContent"
        className="w-full h-full max-h-full flex-nowrap min-h-0 overflow-y-scroll flex flex-col items-center justify-start pl-[0.75rem] pt-2  "
      >
        {Object.keys(itemEntriesMapState).length > 0 &&
          sortArrayByOrder(Object.entries(itemEntriesMapState)).map(([key]) => (
            <div
              id={`ItemListNode-${key}`}
              key={key}
              className="w-full h-fit flex items-center text-md"
            >
              <DirectoryItemNode
                itemEntryReference={dataManager.fetchItem(
                  libraryEntryReference,
                  key
                )}
                className={`w-full`}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

LibraryDirectory.propTypes = {
  libraryEntryReference: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default LibraryDirectory;
