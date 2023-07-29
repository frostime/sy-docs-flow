/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:41:15
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2023-07-29 15:51:16
 * @Description  : 
 */
import { getBlockByID, listDocsByPath } from "./api";

export async function getChildDocs(documentId: DocumentId) {
    let doc: Block = await getBlockByID(documentId);
    let box = doc.box;
    let path = doc.path;

    let data = await listDocsByPath(box, path);
    let ids = data?.files.map((item) => item.id);
    return ids ?? [];
}
