// Auto-assign type based on title heuristics
export const autoAssignType = (title) => {
  const lowerTitle = title.toLowerCase();

  // Front matter
  if (lowerTitle.includes("dedication"))
    return { type: "dedication", section: "front" };
  if (lowerTitle.includes("foreword"))
    return { type: "foreword", section: "front" };
  if (lowerTitle.includes("preface"))
    return { type: "preface", section: "front" };
  if (lowerTitle.includes("introduction"))
    return { type: "introduction", section: "front" };

  // Body matter
  if (lowerTitle.includes("prologue"))
    return { type: "prologue", section: "body" };
  if (lowerTitle.includes("epilogue"))
    return { type: "epilogue", section: "body" };
  if (lowerTitle.includes("chapter"))
    return { type: "chapter", section: "body" };
  if (lowerTitle.includes("part"))
    return { type: "part_divider", section: "body" };
  if (lowerTitle.includes("interlude"))
    return { type: "interlude", section: "body" };

  // Back matter
  if (lowerTitle.includes("afterword"))
    return { type: "afterword", section: "back" };
  if (lowerTitle.includes("acknowledgment"))
    return { type: "acknowledgments", section: "back" };
  if (lowerTitle.includes("about"))
    return { type: "about_author", section: "back" };
  if (lowerTitle.includes("glossary"))
    return { type: "glossary", section: "back" };
  if (lowerTitle.includes("appendix"))
    return { type: "appendix", section: "back" };
  if (lowerTitle.includes("bibliography"))
    return { type: "bibliography", section: "back" };

  // Default to chapter in body
  return { type: "chapter", section: "body" };
};

// Type definitions for each section
export const TYPE_CATEGORIES = {
  front: [
    { value: "title_page", label: "Title Page", isSystem: true },
    { value: "copyright", label: "Copyright", isUser: true },
    { value: "dedication", label: "Dedication", isUser: true },
    { value: "epigraph", label: "Epigraph", isUser: true },
    { value: "table_of_contents", label: "Table of Contents", isSystem: true },
    { value: "foreword", label: "Foreword", isUser: true },
    { value: "preface", label: "Preface", isUser: true },
    { value: "introduction", label: "Introduction", isUser: true },
  ],
  body: [
    { value: "part_divider", label: "Part Divider", isSystem: true },
    { value: "prologue", label: "Prologue", isUser: true },
    { value: "chapter", label: "Chapter", isUser: true },
    { value: "interlude", label: "Interlude", isUser: true },
    { value: "epilogue", label: "Epilogue", isUser: true },
  ],
  back: [
    { value: "afterword", label: "Afterword", isUser: true },
    { value: "acknowledgments", label: "Acknowledgments", isUser: true },
    { value: "about_author", label: "About the Author", isUser: true },
    { value: "also_by", label: "Also By", isUser: true },
    { value: "glossary", label: "Glossary", isUser: true },
    { value: "appendix", label: "Appendix", isUser: true },
    { value: "bibliography", label: "Bibliography", isUser: true },
  ],
};
