# dump6-block-library




---

## DECISION POINTS
1. Block library as JSON file
2. One file or multiple files
3. Block library categorisation as domains, modalities?
4. JSON organization - nested, multi-level nesting, tags as metadata

```json
{
    "block": "age",
    "path": "scene.subjects.details.age",
    "domain": "photography",
    "modality": ["text-to-image", "text-to-video"],
    "type": "core",
    "description": "Subject's age or age range",
    "value": "String value" -> predefined or llm generated
  }
```

## OPTIONS
A. Single json with domains as objects
B. Single json with domain key per block
C. Multiple json files by domain 

Block library categorisation
- Modality (text to image)
- Content type (comic blocks)
- Semantic meaning only


---



```json
  {
    "library": "prompt-blocks",
    "version": "1.0",
    "scene": {
      "subjects": {
        "details": {
          "age": {},
          "gender": {},
          "facialFeatures": {
            "faceShape": {},
            "makeup": {}
          }
        },
        "motion": {
          "locomotion": {},
          "gesture": {},
          "speed": {}
        }
      },
      "environment": {
        "setting": {},
        "timeOfDay": {}
      }
    },
    "composition": {
      "shot": {
        "type": {},
        "angle": {}
      },
      "camera": {
        "movement": {},
        "style": {}
      }
    }
  }
```

---

## TASKS / IDEAS 
- Add to llm guide or framework to first scan the library for available blocks, then suggest new ones if it does not find relevant matches to craft formula. 
- Decide Library CONTENT - when to add new blocks and library curation philosophy
    - Have specialized blocks in template design document first
    - Or as template.json - but I don't need them to be as json at that point
    - Update philosphy - mention that you first test blocks and formulas and then promote working ones the the main library
- Update template folder and doc structure. Each template has its doc with blocks, formulas and testing etc.
- The suggested blocks are temporary first, are not directly introduced into the library. After testing we can promote the suggested blocks to library

---



---

*Notepad ID: cbe68f8c-b7e8-4ed9-ad74-966aaaecb461*

*Created: 11/4/2025, 4:31:33 PM*

