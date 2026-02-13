// Type definitions for each section
export const TYPE_CATEGORIES = {
  frontMatter: {
    title_page: { value: "title_page", label: "Title Page", isSystem: true },
    copyright: { value: "copyright", label: "Copyright", isUser: true },
    dedication: { value: "dedication", label: "Dedication", isUser: true },
    epigraph: { value: "epigraph", label: "Epigraph", isUser: true },
    table_of_contents: {
      value: "table_of_contents",
      label: "Table of Contents",
      isSystem: true,
    },
    foreword: { value: "foreword", label: "Foreword", isUser: true },
    preface: { value: "preface", label: "Preface", isUser: true },
    introduction: {
      value: "introduction",
      label: "Introduction",
      isUser: true,
    },
  },
  bodyMatter: {
    part_divider: {
      value: "part_divider",
      label: "Part Divider",
      isSystem: true,
    },
    prologue: { value: "prologue", label: "Prologue", isUser: true },
    chapter: { value: "chapter", label: "Chapter", isUser: true },
    interlude: { value: "interlude", label: "Interlude", isUser: true },
    epilogue: { value: "epilogue", label: "Epilogue", isUser: true },
  },
  backMatter: {
    afterword: { value: "afterword", label: "Afterword", isUser: true },
    acknowledgments: {
      value: "acknowledgments",
      label: "Acknowledgments",
      isUser: true,
    },
    about_author: {
      value: "about_author",
      label: "About the Author",
      isUser: true,
    },
    also_by: { value: "also_by", label: "Also By", isUser: true },
    glossary: { value: "glossary", label: "Glossary", isUser: true },
    appendix: { value: "appendix", label: "Appendix", isUser: true },
    bibliography: {
      value: "bibliography",
      label: "Bibliography",
      isUser: true,
    },
  },
};
