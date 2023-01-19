import * as applyTableFormat from '../../../lib/modelApi/table/applyTableFormat';
import * as normalizeTable from '../../../lib/modelApi/table/normalizeTable';
import { createContentModelDocument } from '../../../lib/modelApi/creators/createContentModelDocument';
import { createDivider } from '../../../lib/modelApi/creators/createDivider';
import { createListItem } from '../../../lib/modelApi/creators/createListItem';
import { createParagraph } from '../../../lib/modelApi/creators/createParagraph';
import { createSelectionMarker } from '../../../lib/modelApi/creators/createSelectionMarker';
import { createTable } from '../../../lib/modelApi/creators/createTable';
import { createTableCell } from '../../../lib/modelApi/creators/createTableCell';
import { createText } from '../../../lib/modelApi/creators/createText';
import { mergeModel } from '../../../lib/modelApi/common/mergeModel';

describe('mergeModel', () => {
    it('empty to single selection', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();
        const para = createParagraph();
        const marker = createSelectionMarker();

        para.segments.push(marker);
        majorModel.blocks.push(para);

        mergeModel(majorModel, sourceModel);

        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'Paragraph',
                    format: {},
                    segments: [
                        {
                            segmentType: 'SelectionMarker',
                            format: {},
                            isSelected: true,
                        },
                        {
                            segmentType: 'Br',
                            format: {},
                        },
                    ],
                },
            ],
        });
    });

    it('para to single selection', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();
        const para1 = createParagraph();
        const marker = createSelectionMarker();

        const para2 = createParagraph();
        const text1 = createText('test1');
        const text2 = createText('test2');

        para1.segments.push(marker);
        majorModel.blocks.push(para1);

        para2.segments.push(text1, text2);
        sourceModel.blocks.push(para2);

        mergeModel(majorModel, sourceModel);

        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'Paragraph',
                    segments: [
                        {
                            segmentType: 'Text',
                            text: 'test1',
                            format: {},
                        },
                        {
                            segmentType: 'Text',
                            text: 'test2',
                            format: {},
                        },
                        {
                            segmentType: 'SelectionMarker',
                            isSelected: true,
                            format: {},
                        },
                    ],
                    format: {},
                },
            ],
        });
    });

    it('para to para with text selection, with format', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();

        const para1 = createParagraph();
        const text1 = createText('test1', { textColor: 'red' });
        const text2 = createText('test2', { textColor: 'green' });

        const para2 = createParagraph();
        const text3 = createText('test3', { textColor: 'blue' });
        const text4 = createText('test4', { textColor: 'yellow' });

        text2.isSelected = true;

        para1.segments.push(text1, text2);
        para2.segments.push(text3, text4);

        majorModel.blocks.push(para1);
        sourceModel.blocks.push(para2);

        mergeModel(majorModel, sourceModel);

        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'Paragraph',
                    segments: [
                        {
                            segmentType: 'Text',
                            text: 'test1',
                            format: {
                                textColor: 'red',
                            },
                        },
                        {
                            segmentType: 'Text',
                            text: 'test3',
                            format: {
                                textColor: 'blue',
                            },
                        },
                        {
                            segmentType: 'Text',
                            text: 'test4',
                            format: {
                                textColor: 'yellow',
                            },
                        },
                        {
                            segmentType: 'SelectionMarker',
                            isSelected: true,
                            format: {
                                textColor: 'green',
                            },
                        },
                    ],
                    format: {},
                },
            ],
        });
    });

    it('text to divider', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();

        const para1 = createParagraph();
        const text1 = createText('test1', { textColor: 'red' });
        const text2 = createText('test2', { textColor: 'green' });

        const divider1 = createDivider('div');
        divider1.isSelected = true;

        const para2 = createParagraph();
        const text3 = createText('test3', { textColor: 'blue' });
        const text4 = createText('test4', { textColor: 'yellow' });

        text2.isSelected = true;
        text3.isSelected = true;

        para1.segments.push(text1, text2);
        para2.segments.push(text3, text4);

        majorModel.blocks.push(para1);
        majorModel.blocks.push(divider1);
        majorModel.blocks.push(para2);

        const newPara1 = createParagraph();
        const newText1 = createText('newText1');
        const newPara2 = createParagraph();
        const newText2 = createText('newText2');

        newPara1.segments.push(newText1);
        newPara2.segments.push(newText2);

        sourceModel.blocks.push(newPara1);
        sourceModel.blocks.push(newPara2);

        mergeModel(majorModel, sourceModel);

        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'Paragraph',
                    segments: [
                        {
                            segmentType: 'Text',
                            text: 'test1',
                            format: {
                                textColor: 'red',
                            },
                        },
                        {
                            segmentType: 'Text',
                            text: 'newText1',
                            format: {},
                        },
                    ],
                    format: {},
                },
                {
                    blockType: 'Paragraph',
                    segments: [
                        {
                            segmentType: 'Text',
                            text: 'newText2',
                            format: {},
                        },
                        {
                            segmentType: 'SelectionMarker',
                            isSelected: true,
                            format: {
                                textColor: 'green',
                            },
                        },
                        {
                            segmentType: 'Text',
                            text: 'test4',
                            format: {
                                textColor: 'yellow',
                            },
                        },
                    ],
                    format: {},
                },
            ],
        });
    });

    it('text to list', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();

        const list1 = createListItem([{ listType: 'OL' }]);
        const list2 = createListItem([{ listType: 'OL' }]);

        const para1 = createParagraph();
        const para2 = createParagraph();
        const text11 = createText('test11');
        const text12 = createText('test12');
        const text21 = createText('test21');
        const text22 = createText('test21');

        para1.segments.push(text11);
        para1.segments.push(text12);
        para2.segments.push(text21);
        para2.segments.push(text22);

        text12.isSelected = true;
        text21.isSelected = true;

        list1.blocks.push(para1);
        list2.blocks.push(para2);

        majorModel.blocks.push(list1);
        majorModel.blocks.push(list2);

        const newPara1 = createParagraph();
        const newText1 = createText('newText1');
        const newPara2 = createParagraph();
        const newText2 = createText('newText2');
        const newPara3 = createParagraph();
        const newText3 = createText('newText3');

        newPara1.segments.push(newText1);
        newPara2.segments.push(newText2);
        newPara3.segments.push(newText3);

        sourceModel.blocks.push(newPara1);
        sourceModel.blocks.push(newPara2);
        sourceModel.blocks.push(newPara3);

        mergeModel(majorModel, sourceModel);

        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'test11',
                                    format: {},
                                },
                                {
                                    segmentType: 'Text',
                                    text: 'newText1',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'newText2',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'newText3',
                                    format: {},
                                },
                                {
                                    segmentType: 'SelectionMarker',
                                    isSelected: true,
                                    format: {},
                                },
                                {
                                    segmentType: 'Text',
                                    text: 'test21',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
            ],
        });
    });

    it('list to text', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();

        const para1 = createParagraph();
        const text1 = createText('test1');

        para1.segments.push(text1);

        text1.isSelected = true;

        majorModel.blocks.push(para1);

        const newPara1 = createParagraph();
        const newText1 = createText('newText1');
        const newPara2 = createParagraph();
        const newText2 = createText('newText2');
        const newPara3 = createParagraph();
        const newText3 = createText('newText3');
        const newList1 = createListItem([{ listType: 'OL' }]);
        const newList2 = createListItem([{ listType: 'OL' }]);

        newPara1.segments.push(newText1);
        newPara2.segments.push(newText2);
        newPara3.segments.push(newText3);

        newList1.blocks.push(newPara1);
        newList2.blocks.push(newPara2);
        newList2.blocks.push(newPara3);

        sourceModel.blocks.push(newList1);
        sourceModel.blocks.push(newList2);

        mergeModel(majorModel, sourceModel);

        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'newText1',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'newText2',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'newText3',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
                {
                    blockType: 'Paragraph',
                    segments: [
                        {
                            segmentType: 'SelectionMarker',
                            isSelected: true,
                            format: {},
                        },
                        {
                            segmentType: 'Br',
                            format: {},
                        },
                    ],
                    format: {},
                },
            ],
        });
    });

    it('list to list', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();

        const para1 = createParagraph();
        const text11 = createText('test11');
        const text12 = createText('test12');
        const para2 = createParagraph();
        const text21 = createText('test21');
        const text22 = createText('test22');
        const list1 = createListItem([
            { listType: 'OL', startNumberOverride: 1, unorderedStyleType: 2 },
        ]);
        const list2 = createListItem([
            { listType: 'OL', startNumberOverride: 1, unorderedStyleType: 2 },
        ]);

        para1.segments.push(text11);
        para1.segments.push(text12);
        para2.segments.push(text21);
        para2.segments.push(text22);
        list1.blocks.push(para1);
        list2.blocks.push(para2);

        text12.isSelected = true;
        text21.isSelected = true;

        majorModel.blocks.push(list1);
        majorModel.blocks.push(list2);

        const newPara1 = createParagraph();
        const newText1 = createText('newText1');
        const newPara2 = createParagraph();
        const newText2 = createText('newText2');
        const newList1 = createListItem([
            { listType: 'UL', startNumberOverride: 3, unorderedStyleType: 4 },
        ]);
        const newList2 = createListItem([
            { listType: 'UL', startNumberOverride: 3, unorderedStyleType: 4 },
            { listType: 'UL', startNumberOverride: 5, unorderedStyleType: 6 },
        ]);

        newPara1.segments.push(newText1);
        newPara2.segments.push(newText2);

        newList1.blocks.push(newPara1);
        newList2.blocks.push(newPara2);

        sourceModel.blocks.push(newList1);
        sourceModel.blocks.push(newList2);

        mergeModel(majorModel, sourceModel);

        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'test11',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                            startNumberOverride: 1,
                            unorderedStyleType: 2,
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'newText1',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                            startNumberOverride: 1,
                            unorderedStyleType: 2,
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'Text',
                                    text: 'newText2',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                            startNumberOverride: 1,
                            unorderedStyleType: 2,
                        },
                        {
                            listType: 'UL',
                            startNumberOverride: 5,
                            unorderedStyleType: 6,
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
                {
                    blockType: 'BlockGroup',
                    blockGroupType: 'ListItem',
                    blocks: [
                        {
                            blockType: 'Paragraph',
                            segments: [
                                {
                                    segmentType: 'SelectionMarker',
                                    isSelected: true,
                                    format: {},
                                },
                                {
                                    segmentType: 'Text',
                                    text: 'test22',
                                    format: {},
                                },
                            ],
                            format: {},
                        },
                    ],
                    levels: [
                        {
                            listType: 'OL',
                            startNumberOverride: 1,
                            unorderedStyleType: 2,
                        },
                    ],
                    formatHolder: {
                        segmentType: 'SelectionMarker',
                        isSelected: true,
                        format: {},
                    },
                    format: {},
                },
            ],
        });
    });

    it('table to text', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();

        const para1 = createParagraph();
        const text1 = createText('test1');

        para1.segments.push(text1);

        text1.isSelected = true;

        majorModel.blocks.push(para1);

        const newPara1 = createParagraph();
        const newText1 = createText('newText1');
        const newCell1 = createTableCell(false, false);
        const newTable1 = createTable(1);

        newPara1.segments.push(newText1);
        newCell1.blocks.push(newPara1);
        newTable1.cells[0].push(newCell1);

        sourceModel.blocks.push(newTable1);

        mergeModel(majorModel, sourceModel);

        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'Table',
                    cells: [
                        [
                            {
                                blockGroupType: 'TableCell',
                                blocks: [
                                    {
                                        blockType: 'Paragraph',
                                        segments: [
                                            {
                                                segmentType: 'Text',
                                                text: 'newText1',
                                                format: {},
                                            },
                                        ],
                                        format: {},
                                    },
                                ],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                        ],
                    ],
                    format: {},
                    widths: [],
                    heights: [],
                    dataset: {},
                },
                {
                    blockType: 'Paragraph',
                    segments: [
                        {
                            segmentType: 'SelectionMarker',
                            isSelected: true,
                            format: {},
                        },
                        {
                            segmentType: 'Br',
                            format: {},
                        },
                    ],
                    format: {},
                },
            ],
        });
    });

    it('table to table', () => {
        const majorModel = createContentModelDocument();
        const sourceModel = createContentModelDocument();

        const para1 = createParagraph();
        const text1 = createText('test1');
        const cell11 = createTableCell();
        const cell12 = createTableCell();
        const cell21 = createTableCell();
        const cell22 = createTableCell();
        const table1 = createTable(2);

        para1.segments.push(text1);
        text1.isSelected = true;
        cell22.blocks.push(para1);
        table1.cells = [
            [cell11, cell12],
            [cell21, cell22],
        ];

        majorModel.blocks.push(table1);

        const newPara1 = createParagraph();
        const newText1 = createText('newText1');
        const newCell11 = createTableCell();
        const newCell12 = createTableCell();
        const newCell21 = createTableCell();
        const newCell22 = createTableCell();
        const newTable1 = createTable(2);

        newPara1.segments.push(newText1);
        newCell12.blocks.push(newPara1);
        newTable1.cells = [
            [newCell11, newCell12],
            [newCell21, newCell22],
        ];

        sourceModel.blocks.push(newTable1);

        spyOn(applyTableFormat, 'applyTableFormat');
        spyOn(normalizeTable, 'normalizeTable');

        mergeModel(majorModel, sourceModel);

        expect(normalizeTable.normalizeTable).toHaveBeenCalledTimes(1);
        expect(majorModel).toEqual({
            blockGroupType: 'Document',
            blocks: [
                {
                    blockType: 'Table',
                    cells: [
                        [
                            {
                                blockGroupType: 'TableCell',
                                blocks: [],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                            {
                                blockGroupType: 'TableCell',
                                blocks: [],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                            {
                                blockGroupType: 'TableCell',
                                blocks: [],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                        ],
                        [
                            {
                                blockGroupType: 'TableCell',
                                blocks: [],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                            {
                                blockGroupType: 'TableCell',
                                blocks: [
                                    {
                                        blockType: 'Paragraph',
                                        segments: [
                                            {
                                                segmentType: 'SelectionMarker',
                                                isSelected: true,
                                                format: {},
                                            },
                                        ],
                                        format: {},
                                        isImplicit: true,
                                    },
                                ],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                            {
                                blockGroupType: 'TableCell',
                                blocks: [
                                    {
                                        blockType: 'Paragraph',
                                        segments: [
                                            {
                                                segmentType: 'Text',
                                                text: 'newText1',
                                                format: {},
                                            },
                                        ],
                                        format: {},
                                    },
                                ],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                        ],
                        [
                            {
                                blockGroupType: 'TableCell',
                                blocks: [],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                            {
                                blockGroupType: 'TableCell',
                                blocks: [],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                            {
                                blockGroupType: 'TableCell',
                                blocks: [],
                                format: {},
                                spanLeft: false,
                                spanAbove: false,
                                isHeader: false,
                                dataset: {},
                            },
                        ],
                    ],
                    format: {},
                    widths: [],
                    heights: [],
                    dataset: {},
                },
            ],
        });
    });
});