import { IFPath } from "../../../packages/infinity-core/scene/shape/path";
import { IFPathBase } from "../../../packages/infinity-core/scene/shape/pathbase";
import { IFPoint } from "../../../packages/infinity-core/geometry/point";
import { ifMath } from "../../../packages/infinity-core/core/math";

const AnchorPoint = IFPathBase.AnchorPoint;
const Type = IFPathBase.AnchorPoint.Type;
const CornerType = IFPathBase.CornerType;

/**
 * Builds an anchor point, mirroring the old `new GXPath.AnchorPoint(pos, tp, h1, h2)`
 * constructor through the current property-based API.
 */
function makeAnchorPoint(pos, tp, h1, h2) {
  const anchorPt = new AnchorPoint();
  if (pos) {
    anchorPt.setProperty("x", pos.getX());
    anchorPt.setProperty("y", pos.getY());
  }
  if (tp) {
    anchorPt.setProperty("tp", tp);
  }
  if (h1) {
    anchorPt.setProperty("hlx", h1.getX());
    anchorPt.setProperty("hly", h1.getY());
  }
  if (h2) {
    anchorPt.setProperty("hrx", h2.getX());
    anchorPt.setProperty("hry", h2.getY());
  }
  return anchorPt;
}

/**
 * Old `path.setCType(ctype, cx, cy)`: applies a corner type and (for styled
 * corners) shoulder lengths to every anchor point.
 */
function setPathCornerType(path, tp, cx, cy) {
  const styled = IFPathBase.isCornerType(tp);
  for (
    let anchorPt = path.getAnchorPoints().getFirstChild();
    anchorPt;
    anchorPt = anchorPt.getNext()
  ) {
    anchorPt.setProperty("tp", tp);
    if (styled) {
      anchorPt.setProperty("cu", false);
      anchorPt.setProperty("cl", cx);
      anchorPt.setProperty("cr", cy);
    }
  }
}

/**
 * Old `path.setAuto(auto)`: toggles auto handles on every anchor point.
 */
function setPathAuto(path, auto) {
  for (
    let anchorPt = path.getAnchorPoints().getFirstChild();
    anchorPt;
    anchorPt = anchorPt.getNext()
  ) {
    anchorPt.setProperty("ah", auto);
  }
}

describe("IFPath", () => {
  it("Set and get PROPERTY_CLOSED", () => {
    const path = new IFPath();

    expect(path).to.be.an("Object");

    expect(path.getProperty("closed")).to.be.false;
    path.setProperty("closed", true);
    expect(path.getProperty("closed")).to.be.true;
    path.setProperty("closed", false);
    expect(path.getProperty("closed")).to.not.be.ok;
  });

  it.skip(
    "Updates handles of first two points and last two points when setting PROPERTY_CLOSED",
  );

  it("#getAnchorPoints returns AnchorPointContainer", () => {
    const path = new IFPath();
    const container = path.getAnchorPoints();
    expect(container.toString()).to.equal("[Object IFPathBase.AnchorPoints]");
  });

  it("#setCType updates corner type and shoulders length for all anchor points in the path", () => {
    const path = new IFPath();
    path
      .getAnchorPoints()
      .appendChild(
        makeAnchorPoint(new IFPoint(10, 10), null, null, new IFPoint(15, 0)),
      );
    path
      .getAnchorPoints()
      .appendChild(
        makeAnchorPoint(
          new IFPoint(50, 10),
          null,
          new IFPoint(15, -10),
          new IFPoint(60, 20),
        ),
      );
    path.getAnchorPoints().appendChild(makeAnchorPoint(new IFPoint(50, 70)));
    path.getAnchorPoints().appendChild(makeAnchorPoint(new IFPoint(30, 100)));
    const aCTypes = [
      Type.Asymmetric,
      Type.Connector,
      Type.Mirror,
      CornerType.Rounded,
      CornerType.InverseRounded,
      CornerType.Bevel,
      CornerType.Inset,
      CornerType.Fancy,
    ];
    let tp;
    let cx = 5;
    let cy = 10;
    for (let i = 0; i < aCTypes.length; ++i, ++cx, ++cy) {
      tp = aCTypes[i];

      setPathCornerType(path, tp, cx, cy);

      for (
        let anchorPt = path.getAnchorPoints().getFirstChild();
        anchorPt != null;
        anchorPt = anchorPt.getNext()
      ) {
        expect(anchorPt.$tp).to.be.equal(tp);
        if (IFPathBase.isCornerType(tp)) {
          expect(anchorPt.$cl).to.be.equal(cx);
          expect(anchorPt.$cr).to.be.equal(cy);
        }
      }
    }
  });

  it("#setAuto updates handles to be auto or not for all anchor points in the path", () => {
    const aCTypes = [
      Type.Asymmetric,
      Type.Connector,
      Type.Mirror,
      CornerType.Rounded,
      CornerType.InverseRounded,
      CornerType.Bevel,
      CornerType.Inset,
      CornerType.Fancy,
    ];

    const path = new IFPath();
    for (let i = 0; i < aCTypes.length; ++i) {
      path
        .getAnchorPoints()
        .appendChild(
          makeAnchorPoint(
            new IFPoint(5 * i, 10 * i + i),
            aCTypes[i],
            new IFPoint(0, 8 * i),
            new IFPoint(3 * i, 0),
          ),
        );
    }

    let anchorPt;
    for (
      anchorPt = path.getAnchorPoints().getFirstChild();
      anchorPt != null;
      anchorPt = anchorPt.getNext()
    ) {
      expect(anchorPt.$ah).to.be.false;
    }
    setPathAuto(path, true);
    for (
      anchorPt = path.getAnchorPoints().getFirstChild();
      anchorPt != null;
      anchorPt = anchorPt.getNext()
    ) {
      expect(anchorPt.$ah).to.be.true;
    }
    setPathAuto(path, false);
    for (
      anchorPt = path.getAnchorPoints().getFirstChild();
      anchorPt != null;
      anchorPt = anchorPt.getNext()
    ) {
      expect(anchorPt.$ah).to.be.false;
    }
  });

  it.skip("#_detailHitTest makes hit-testing");

  it.skip(
    "#insertChild insert anchor point and recalculate handles of this and two neighbour points",
  );

  it.skip(
    "#removeChild remove anchor point and recalculate handles of two neighbour points",
  );

  describe("AnchorPoint", () => {
    it("should construct AnchorPoint", () => {
      expect(typeof AnchorPoint).to.equal("function");
      let anchorPt = new AnchorPoint();
      expect(anchorPt).to.have.property("$x");
      expect(anchorPt).to.have.property("$y");
      expect(anchorPt).to.have.property("$hlx");
      expect(anchorPt).to.have.property("$hly");
      expect(anchorPt).to.have.property("$hrx");
      expect(anchorPt).to.have.property("$hry");
      expect(anchorPt).to.have.property("$cl");
      expect(anchorPt).to.have.property("$cr");
      expect(anchorPt).to.have.property("$tp");
      expect(anchorPt).to.have.property("$ah");
      expect(anchorPt.$x).to.be.equal(0);
      expect(anchorPt.$y).to.be.equal(0);
      expect(anchorPt.$hlx).to.be.null;
      expect(anchorPt.$hly).to.be.null;
      expect(anchorPt.$hrx).to.be.null;
      expect(anchorPt.$hry).to.be.null;
      expect(anchorPt.$tp).to.be.equal(Type.Asymmetric);
      expect(anchorPt.$cl).to.be.equal(0);
      expect(anchorPt.$cr).to.be.equal(0);
      expect(anchorPt.$ah).to.not.be.ok;

      const x = 20;
      const y = 30.5;
      const hlx = 40;
      const hly = 50.5;
      const hrx = 60;
      const hry = 60.5;
      anchorPt = makeAnchorPoint(
        new IFPoint(x, y),
        null,
        null,
        new IFPoint(hrx, hry),
      );

      expect(anchorPt.$x).to.be.equal(x);
      expect(anchorPt.$y).to.be.equal(y);
      expect(anchorPt.$hlx).to.be.null;
      expect(anchorPt.$hly).to.be.null;
      expect(anchorPt.$hrx).to.be.equal(hrx);
      expect(anchorPt.$hry).to.be.equal(hry);
      expect(anchorPt.$tp).to.be.equal(Type.Asymmetric);

      anchorPt = makeAnchorPoint(
        new IFPoint(x, y),
        Type.Connector,
        new IFPoint(hlx, hly),
        new IFPoint(hrx, hry),
      );

      expect(anchorPt.$hlx).to.be.equal(hlx);
      expect(anchorPt.$hly).to.be.equal(hly);
      expect(anchorPt.$hrx).to.be.equal(hrx);
      expect(anchorPt.$hry).to.be.equal(hry);
      expect(anchorPt.$tp).to.be.equal(Type.Connector);

      anchorPt = makeAnchorPoint(
        new IFPoint(x, y),
        Type.Symmetric,
        new IFPoint(hlx, hly),
      );

      expect(anchorPt.$tp).to.be.equal(Type.Symmetric);
      expect(anchorPt.$hlx).to.be.equal(hlx);
      expect(anchorPt.$hly).to.be.equal(hly);
      expect(anchorPt.$hrx).to.be.null;
      expect(anchorPt.$hry).to.be.null;
    });

    describe("#setProperty with AnchorPoint.PROPERTY_CL, AnchorPoint.PROPERTY_CR", () => {
      it("Update anchor point shoulders lengths ($cl, $cr) for all styled corners", () => {
        const anchorPt = new AnchorPoint();

        const styledCornerTypes = [
          CornerType.Rounded,
          CornerType.InverseRounded,
          CornerType.Bevel,
          CornerType.Inset,
          CornerType.Fancy,
        ];

        let cornerType;
        const cx = 10;
        const cy = 15;
        for (let i = 0; i < styledCornerTypes.length; ++i) {
          cornerType = styledCornerTypes[i];
          anchorPt.setProperty("tp", cornerType);
          expect(anchorPt.$cl).to.be.equal(0);
          expect(anchorPt.$cr).to.be.equal(0);
          anchorPt.setProperty("cu", false);
          anchorPt.setProperty("cl", cx);
          anchorPt.setProperty("cr", cy);
          expect(anchorPt.$cl).to.be.equal(cx);
          expect(anchorPt.$cr).to.be.equal(cy);
          anchorPt.setProperty("cl", 0);
          anchorPt.setProperty("cr", 0);
          expect(anchorPt.$cl).to.be.equal(0);
          expect(anchorPt.$cr).to.be.equal(0);
        }
      });
    });

    describe("#setProperty with AnchorPoint.PROPERTY_TP", () => {
      it("Update anchor point corner type ($tp property)", () => {
        const anchorPt = new AnchorPoint();

        const anchorCTypes = [
          Type.Connector,
          Type.Mirror,
          Type.Asymmetric,
          CornerType.Rounded,
          CornerType.InverseRounded,
          CornerType.Bevel,
          CornerType.Inset,
          CornerType.Fancy,
        ];

        let cornerType;

        expect(anchorPt.$tp).to.be.equal(Type.Asymmetric);
        for (let i = 0; i < anchorCTypes.length; ++i) {
          cornerType = anchorCTypes[i];
          anchorPt.setProperty("tp", cornerType);
          expect(anchorPt.$tp).to.be.equal(cornerType);
        }
      });

      it("Recalculate handles of anchor point for Connector type: Start point - path closed", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));
        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("tp", Type.Connector);
        expect(aPt.$hlx).to.be.equal(x1 - 5);
        expect(aPt.$hly).to.be.equal(y1);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 + 5);
      });

      it("Recalculate handles of anchor point for Connector type: Start point - path opened", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));

        const aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("tp", Type.Connector);
        expect(aPt.$hlx).to.be.equal(x1 - 5);
        expect(aPt.$hly).to.be.equal(y1);
        expect(aPt.$hrx).to.be.equal(x1 + 5);
        expect(aPt.$hry).to.be.equal(y1);
      });

      it("Recalculate handles of anchor point for Connector type: End point - path closed", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(60, 10),
              new IFPoint(40, 5),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1 + 5, y1),
              new IFPoint(x1, y1 + 5),
            ),
          );
        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getLastChild();
        aPt.setProperty("tp", Type.Connector);
        expect(aPt.$hrx).to.be.equal(x1 - 5);
        expect(aPt.$hry).to.be.equal(y1);
        expect(aPt.$hlx).to.be.equal(x1);
        expect(aPt.$hly).to.be.equal(y1 + 5);
      });

      it("Recalculate handles of anchor point for Connector type: End point - path opened", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(60, 10),
              new IFPoint(40, 5),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1 + 5, y1),
              new IFPoint(x1, y1 + 5),
            ),
          );

        const aPt = path.getAnchorPoints().getLastChild();
        aPt.setProperty("tp", Type.Connector);
        expect(aPt.$hrx).to.be.equal(x1 - 5);
        expect(aPt.$hry).to.be.equal(y1);
        expect(aPt.$hlx).to.be.equal(x1 + 5);
        expect(aPt.$hly).to.be.equal(y1);
      });

      it("Recalculate handles of anchor point for Connector type: path middle point", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));

        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getFirstChild().getNext();
        aPt.setProperty("tp", Type.Connector);
        expect(aPt.$hlx).to.be.equal(x1 - 5);
        expect(aPt.$hly).to.be.equal(y1);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 + 5);
      });

      it.skip("Recalculate (not auto-)handles of anchor point for Smooth type: Start point - path closed", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1 - 10, y2)));
        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("tp", Type.Symmetric);
        expect(aPt.$hlx).to.be.equal(x1);
        expect(aPt.$hly).to.be.equal(y1 + 5);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 - 5);
      });

      it.skip("Recalculate (not auto-)handles of anchor point for Smooth type: Start point - path opened", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1 - 10, y2)));

        const aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("tp", Type.Symmetric);
        expect(aPt.$hlx).to.be.equal(x1);
        expect(aPt.$hly).to.be.equal(y1 + 5);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 - 5);
      });

      it.skip("Recalculate (not auto-)handles of anchor point for Smooth type: End point - path closed", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1 - 10, y2)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(60, 10),
              new IFPoint(40, 5),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 - 5, y1),
            ),
          );

        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getLastChild();
        aPt.setProperty("tp", Type.Symmetric);
        expect(aPt.$hlx).to.be.equal(x1);
        expect(aPt.$hly).to.be.equal(y1 + 5);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 - 5);
      });

      it.skip("Recalculate (not auto-)handles of anchor point for Smooth type: End point - path opened", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1 - 10, y2)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(60, 10),
              new IFPoint(40, 5),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 - 5, y1),
            ),
          );

        const aPt = path.getAnchorPoints().getLastChild();
        aPt.setProperty("tp", Type.Symmetric);
        expect(aPt.$hlx).to.be.equal(x1);
        expect(aPt.$hly).to.be.equal(y1 + 5);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 - 5);
      });

      it.skip("Recalculate (not auto-)handles of anchor point for Smooth type: path middle point", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1 - 10, y2)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));

        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getFirstChild().getNext();
        aPt.setProperty("tp", Type.Symmetric);
        expect(aPt.$hlx).to.be.equal(x1);
        expect(aPt.$hly).to.be.equal(y1 + 5);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 - 5);
      });
    });

    describe("#setProperty with AnchorPoint.PROPERTY_AUTO_HANDLES", () => {
      it("Updates $ah property", () => {
        const anchorPt = new AnchorPoint();

        const anchorCTypes = [
          Type.Asymmetric,
          Type.Connector,
          Type.Mirror,
          CornerType.Rounded,
          CornerType.InverseRounded,
          CornerType.Bevel,
          CornerType.Inset,
          CornerType.Fancy,
        ];

        let cornerType;
        for (let i = 0; i < anchorCTypes.length; ++i) {
          cornerType = anchorCTypes[i];
          anchorPt.setProperty("tp", cornerType);
          expect(anchorPt.$ah).to.be.false;
          anchorPt.setProperty("ah", true);
          expect(anchorPt.$ah).to.be.true;
          anchorPt.setProperty("ah", false);
          expect(anchorPt.$ah).to.be.false;
        }
      });

      it("Recalculate handles of anchor point for Smooth type: Start point - path closed", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const x2 = 50;
        const y2 = y1;
        const x4 = x1 - 10;
        const y4 = -10;

        let aPt;
        let res;
        let ptx;
        let pty;
        let ccntr;
        const offs = AnchorPoint.HANDLE_COEFF;
        let dirLen;
        let hLen;
        let dx;
        let dy;

        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              Type.Mirror,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y2),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x4, y4)));
        path.setProperty("closed", true);

        aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("ah", true);

        ccntr = ifMath.getCircumcircleCenter(x4, y4, x1, y1, x2, y2);
        dirLen = Math.sqrt(
          ifMath.ptSqrDist(x1, y1, ccntr.getX(), ccntr.getY()),
        );
        dx = (y1 - ccntr.getY()) / dirLen;
        dy = (ccntr.getX() - x1) / dirLen;
        if (
          ifMath.segmentSide(x1, y1, (x4 + x2) / 2, (y4 + y2) / 2, x4, y4) !=
          ifMath.segmentSide(
            x1,
            y1,
            (x4 + x2) / 2,
            (y4 + y2) / 2,
            x1 - dx,
            y1 - dy,
          )
        ) {
          dx = -dx;
          dy = -dy;
        }

        hLen = Math.sqrt(ifMath.ptSqrDist(x1, y1, x4, y4)) * offs;

        ptx = x1 - dx * hLen;
        res = ifMath.isEqualEps(aPt.$hlx, ptx);
        expect(res).to.be.true;

        pty = y1 - dy * hLen;
        res = ifMath.isEqualEps(aPt.$hly, pty);
        expect(res).to.be.true;

        hLen = Math.sqrt(ifMath.ptSqrDist(x1, y1, x2, y2)) * offs;

        ptx = x1 + dx * hLen;
        res = ifMath.isEqualEps(aPt.$hrx, ptx);
        expect(res).to.be.true;

        pty = y1 + dy * hLen;
        res = ifMath.isEqualEps(aPt.$hry, pty);
        expect(res).to.be.true;
      });

      it("Recalculate handles of anchor point for Smooth type: Start point - path opened", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const x2 = 50;

        let aPt;
        let res;

        const offs = AnchorPoint.HANDLE_COEFF;
        let hLen;

        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              Type.Mirror,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1, y1 - 3),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1 - 10, -10)));

        aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("ah", true);

        hLen = (x2 - x1) * offs;

        res = ifMath.isEqualEps(aPt.$hlx, x1 - hLen);
        expect(res).to.be.true;

        res = ifMath.isEqualEps(aPt.$hly, y1);
        expect(res).to.be.true;

        res = ifMath.isEqualEps(aPt.$hrx, x1 + hLen);
        expect(res).to.be.true;

        res = ifMath.isEqualEps(aPt.$hry, y1);
        expect(res).to.be.true;
      });

      it.skip(
        "Recalculate handles of anchor point for Smooth type: End point - path closed",
      );

      it.skip(
        "Recalculate handles of anchor point for Smooth type: End point - path opened",
      );

      it.skip(
        "Recalculate handles of anchor point for Smooth type: path middle point",
      );

      it.skip(
        "Recalculate handles for Regular and styled corners: Start point - path closed",
      );

      it.skip("Recalculate handles of Regular and styled corners: Start point - path opened", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const x2 = 50;
        const y2 = y1;
        const x3 = 50;
        const y3 = 70;

        let aPt;
        let res;
        let ptx;
        let pty;
        let ccntr;
        const offs = AnchorPoint.HANDLE_COEFF;
        let dirLen;
        let hLen;
        let dx;
        let dy;

        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              null,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1, y1 - 5),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y2),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x3, y3)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1 - 10, -10)));

        aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("ah", true);

        ccntr = ifMath.getCircumcircleCenter(x1, y1, x2, y2, x3, y3);
        dirLen = Math.sqrt(
          ifMath.ptSqrDist(x1, y1, ccntr.getX(), ccntr.getY()),
        );
        dx = (y1 - ccntr.getY()) / dirLen;
        dy = (ccntr.getX() - x1) / dirLen;
        if (
          ifMath.segmentSide(x1, y1, (x2 + x3) / 2, (y2 + y3) / 2, x2, y2) !=
          ifMath.segmentSide(
            x1,
            y1,
            (x2 + x3) / 2,
            (y2 + y3) / 2,
            x1 + dx,
            y1 + dy,
          )
        ) {
          dx = -dx;
          dy = -dy;
        }

        hLen = Math.sqrt(ifMath.ptSqrDist(x1, y1, x2, y2)) * offs;

        ptx = x1 + dx * hLen;
        res = ifMath.isEqualEps(aPt.$hrx, ptx);
        expect(res).to.be.true;

        pty = y1 + dy * hLen;
        res = ifMath.isEqualEps(aPt.$hry, pty);
        expect(res).to.be.true;

        expect(aPt.$hlx).to.be.null;
        expect(aPt.$hly).to.be.null;
      });

      it.skip(
        "Recalculate handles of Regular and styled corners: End point - path closed",
      );

      it.skip(
        "Recalculate handles of Regular and styled corners: End point - path opened",
      );

      it.skip(
        "Recalculate handles of Regular and styled corners: path middle point",
      );

      it.skip("Do not affect handles of Connector anchor points: Start point - path closed", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              Type.Connector,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));
        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("ah", true);
        expect(aPt.$hlx).to.be.equal(x1 - 5);
        expect(aPt.$hly).to.be.equal(y1);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 + 5);
      });

      it.skip("Do not affect handles of Connector anchor points: Start point - path opened", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              Type.Connector,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));

        const aPt = path.getAnchorPoints().getFirstChild();
        aPt.setProperty("ah", true);
        expect(aPt.$hlx).to.be.equal(x1 - 5);
        expect(aPt.$hly).to.be.equal(y1);
        expect(aPt.$hrx).to.be.equal(x1 + 5);
        expect(aPt.$hry).to.be.equal(y1);
      });

      it.skip("Do not affect handles of Connector anchor points: End point - path closed", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(60, 10),
              new IFPoint(40, 5),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              Type.Connector,
              new IFPoint(x1 + 5, y1),
              new IFPoint(x1, y1 + 5),
            ),
          );
        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getLastChild();
        aPt.setProperty("ah", true);
        expect(aPt.$hrx).to.be.equal(x1 - 5);
        expect(aPt.$hry).to.be.equal(y1);
        expect(aPt.$hlx).to.be.equal(x1);
        expect(aPt.$hly).to.be.equal(y1 + 5);
      });

      it.skip("Do not affect handles of Connector anchor points: End point - path opened", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(60, 10),
              new IFPoint(40, 5),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              Type.Connector,
              new IFPoint(x1 + 5, y1),
              new IFPoint(x1, y1 + 5),
            ),
          );

        const aPt = path.getAnchorPoints().getLastChild();
        aPt.setProperty("ah", true);
        expect(aPt.$hrx).to.be.equal(x1 - 5);
        expect(aPt.$hry).to.be.equal(y1);
        expect(aPt.$hlx).to.be.equal(x1 + 5);
        expect(aPt.$hly).to.be.equal(y1);
      });

      it.skip("Do not affect handles of Connector anchor points: path middle point", () => {
        const path = new IFPath();
        const x1 = 10;
        const y1 = 0;
        const y2 = -10;
        const x2 = 50;
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(x1, y2)));
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x1, y1),
              Type.Connector,
              new IFPoint(x1, y1 + 5),
              new IFPoint(x1 + 5, y1),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(
            makeAnchorPoint(
              new IFPoint(x2, y1),
              null,
              new IFPoint(40, 5),
              new IFPoint(60, 10),
            ),
          );
        path
          .getAnchorPoints()
          .appendChild(makeAnchorPoint(new IFPoint(50, 70)));

        path.setProperty("closed", true);

        const aPt = path.getAnchorPoints().getFirstChild().getNext();
        aPt.setProperty("ah", true);
        expect(aPt.$hlx).to.be.equal(x1 - 5);
        expect(aPt.$hly).to.be.equal(y1);
        expect(aPt.$hrx).to.be.equal(x1);
        expect(aPt.$hry).to.be.equal(y1 + 5);
      });
    });

    it.skip(
      "setting corner type Smooth when auto-handles are marked works the same as setting auto handles for Smooth corner type",
    );

    describe("#transform", () => {
      it.skip("Makes shift transformation of anchor point with handles");

      it.skip(
        "Makes scaling of anchor point with handles and shoulders(if handles or neighbour points present)",
      );

      it.skip("Makes rotation of anchor point with handles");

      it.skip(
        "Makes complex transformation of anchor point with handles and shoulders",
      );
    });
  });

  describe("AnchorPointContainer", () => {
    describe("#appendChild", () => {
      it("should add anchorPoint to container", () => {
        const path = new IFPath();
        const container = path.getAnchorPoints();
        const brim = 20;
        const pathWidth = 50;
        const pathHeight = 60;

        const anchorPointOrig = makeAnchorPoint(
          new IFPoint(brim, brim),
          null,
          null,
          new IFPoint(brim + pathWidth / 2, 0),
        );

        expect(container.getFirstChild()).to.be.null;
        container.appendChild(anchorPointOrig);

        const anchorPoint1 = container.getFirstChild();

        expect(anchorPoint1.toString()).to.equal(
          "[Object IFPathBase.AnchorPoint]",
        );
        expect(anchorPoint1.$x).to.equal(anchorPointOrig.$x);
        expect(anchorPoint1.$y).to.equal(anchorPointOrig.$y);
        expect(anchorPoint1.$tp).to.equal(anchorPointOrig.$tp);

        container.appendChild(
          makeAnchorPoint(
            new IFPoint(brim + pathWidth, brim),
            CornerType.Inset,
            new IFPoint(brim + (pathWidth / 3) * 2, brim + pathHeight / 3),
            new IFPoint(pathWidth + brim, 40),
          ),
        );
        const anchorPoint2 = container.getLastChild();
        expect(anchorPoint2).to.not.equal(anchorPoint1);
        expect(anchorPoint2.toString()).to.equal(
          "[Object IFPathBase.AnchorPoint]",
        );
        expect(anchorPoint2.$x).to.equal(brim + pathWidth);
        expect(anchorPoint2.$y).to.equal(brim);
        expect(anchorPoint2.$tp).to.equal(CornerType.Inset);
        expect(anchorPoint2.$hlx).to.equal(brim + (pathWidth / 3) * 2);
        expect(anchorPoint2.$hly).to.equal(brim + pathHeight / 3);
        expect(anchorPoint2.$hrx).to.equal(pathWidth + brim);
        expect(anchorPoint2.$hry).to.equal(40);
      });
    });

    describe.skip("#readVertex", () => {
      it(
        "calculate styled corners from anchor points and return path vertices one by one",
      );
    });

    describe.skip("#appendVertices", () => {
      it("Compose anchor points from source vertices and adds to container");

      it(
        "Updates handles of the two first and last and new points according to type",
      );
    });

    describe.skip("#clearVertices", () => {
      it("Remove all vertices from container");
    });

    describe.skip("#rewindVertices", () => {
      it("Reset iterator to the first child");
    });
  });
});
