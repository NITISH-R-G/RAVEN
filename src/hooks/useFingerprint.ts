import { useState, useEffect } from 'react';
import {
  computeBrowserFingerprint,
  WebFingerprint,
  getFingerprintJSVisitorId,
} from '../utils/fingerprint';
import { DocumentItem } from '../types';

export function useFingerprint(initialDocuments: DocumentItem[]) {
  const [browserFingerprint, setBrowserFingerprint] = useState<WebFingerprint | null>(null);
  const [documentsState, setDocumentsState] = useState<DocumentItem[]>(initialDocuments);

  useEffect(() => {
    const fp = computeBrowserFingerprint();
    setBrowserFingerprint(fp);

    getFingerprintJSVisitorId().then((visitorId) => {
      let activeFp = fp;
      if (visitorId) {
        activeFp = {
          ...fp,
          fpjsVisitorId: visitorId,
          id: `fp-${visitorId.slice(0, 8)}`,
        };
        setBrowserFingerprint(activeFp);
      }

      const updatedDocs = initialDocuments.map((doc) => {
        if (doc.id === 'doc-devices' && activeFp) {
          return {
            ...doc,
            content: doc.content.replace('fp-88a29b4e', activeFp.id),
          };
        }
        return doc;
      });
      setDocumentsState(updatedDocs);
      // Avoid auto-triggering verification on mount
    });
  }, [initialDocuments]);

  return {
    browserFingerprint,
    setBrowserFingerprint,
    documentsState,
    setDocumentsState,
  };
}
