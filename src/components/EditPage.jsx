import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import { FaDownload, FaArrowLeft, FaTextHeight, FaSquare, FaCircle, FaLayerGroup } from 'react-icons/fa';
import { MdDelete, MdColorLens, MdChangeHistory, MdOutlineLayers } from 'react-icons/md';
import styles from './EditPage.module.css';
import { BiImageAlt } from 'react-icons/bi';

function EditPage({ selectedImage }) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [color, setColor] = useState('#4facfe');
  const [textColor, setTextColor] = useState('#ffffff');
  const [borderWidth, setBorderWidth] = useState(5);
  const [showDelete, setShowDelete] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    if (selectedImage) {
      fabric.Image.fromURL(
        selectedImage,
        (img) => {
          const scale = Math.min(
            containerWidth / img.width,
            containerHeight / img.height
          );

          const left = (containerWidth - img.width * scale) / 2;
          const top = (containerHeight - img.height * scale) / 2;

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: left,
            top: top,
            selectable: false,
            evented: false,
            name: 'backgroundImage',
          });

          fabricCanvas.add(img);
          fabricCanvas.renderAll();
        },
        {
          crossOrigin: 'anonymous', // Fix CORS issues
        }
      );
    }

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [selectedImage]);

  useEffect(() => {
    if (canvas) {
      canvas.on('selection:created', () => {
        setShowDelete(true);
      });

      canvas.on('selection:cleared', () => {
        setShowDelete(false);
      });
    }
  }, [canvas]);

  const addText = () => {
    if (canvas) {
      const text = new fabric.IText('Double click to edit', {
        left: 50,
        top: 50,
        fontSize: 24,
        fill: textColor,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        shadow: 'rgba(0,0,0,0.5) 2px 2px 8px',
        stroke: '#000000',
        strokeWidth: 1,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        name: 'text',
        selectable: true,
        hasControls: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();

      // Recalculate canvas and background image
      handleResize();
    }
  };

  const addShape = (type) => {
    if (canvas) {
      let shape;
      const shapeProps = {
        left: 100,
        top: 100,
        fill: color,
        opacity: 0.8,
        stroke: '#ffffff',
        strokeWidth: 2,
        shadow: new fabric.Shadow('rgba(0,0,0,0.3) 3px 3px 5px'),
        name: 'shape',
        isShape: true,
        selectable: true,
        hasControls: true,
      };

      switch (type) {
        case 'rectangle':
          shape = new fabric.Rect({
            ...shapeProps,
            width: 100,
            height: 100,
          });
          break;
        case 'circle':
          shape = new fabric.Circle({
            ...shapeProps,
            radius: 50,
          });
          break;
        case 'triangle':
          shape = new fabric.Triangle({
            ...shapeProps,
            width: 100,
            height: 100,
          });
          break;
      }

      if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();

        // Recalculate canvas and background image
        handleResize();
      }
    }
  };

  const deleteSelected = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
        setShowDelete(false); // Optionally hide the delete button if needed
      }
    }
  };

  const changeColor = (newColor) => {
    setColor(newColor);
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.isShape) {
        activeObject.set('fill', newColor);
        canvas.renderAll();
      }
    }
  };

  const changeTextColor = (newColor) => {
    setTextColor(newColor);
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fill', newColor);
        canvas.renderAll();
      }
    }
  };

  const bringToFront = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.bringToFront(activeObject);
        canvas.renderAll();
      }
    }
  };

  const sendToBack = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.sendToBack(activeObject);
        const background = canvas.getObjects().find(obj => obj.name === 'backgroundImage');
        if (background) {
          canvas.sendToBack(background);
        }
        canvas.renderAll();
      }
    }
  };

  const downloadEditedImage = () => {
    if (!canvas) return;

    // Adjust the canvas dimensions to match the original image dimensions
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    // Create a temporary canvas to render the final image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Render the canvas content onto the temporary canvas
    tempCtx.drawImage(canvas.lowerCanvasEl, 0, 0, originalWidth, originalHeight);

    // Export the canvas content as an image
    tempCanvas.toBlob(blob => {
        const link = document.createElement('a');
        link.download = `edited-image-${Date.now()}.png`;
        const url = URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }, 'image/png', 1.0);
  };

  const downloadOriginalImage = async () => {
    if (selectedImage) {
      try {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `original_image_${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        setShowDownloadOptions(false);
      } catch (error) {
        console.error('Error downloading original image:', error);
        const link = document.createElement('a');
        link.download = `original_image_${Date.now()}.png`;
        link.href = selectedImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownloadOptions(false);
      }
    }
  };

  const handleResize = () => {
    if (canvas && canvasContainerRef.current) {
      const container = canvasContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      canvas.setDimensions({
        width: containerWidth,
        height: containerHeight,
      });

      const bgImage = canvas.getObjects().find(obj => obj.name === 'backgroundImage');
      if (bgImage) {
        const scale = Math.min(
          containerWidth / bgImage.width,
          containerHeight / bgImage.height
        );

        const left = (containerWidth - bgImage.width * scale) / 2;
        const top = (containerHeight - bgImage.height * scale) / 2;

        bgImage.set({
          scaleX: scale,
          scaleY: scale,
          left: left,
          top: top,
        });

        bgImage.setCoords(); // Update coordinates
      }

      canvas.renderAll();
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas]);

  return (
    <div className={styles.editorPage}>
      <div className={styles.editorContainer}>
        <button 
          className={styles.backButton} 
          onClick={() => navigate('/')}
        >
          <FaArrowLeft className={styles.backIcon} />
          <span>Back to Search</span>
        </button>
        
        <div className={styles.canvasWrapper}>
            <div className={styles.canvasContainer} ref={canvasContainerRef}>
                <canvas ref={canvasRef} />
            </div>
        </div>
        
        <div className={styles.toolbar}>
          <div className={styles.toolGroup}>
            <button 
              onClick={addText}
              className={`${styles.toolButton} ${activeTool === 'text' ? styles.active : ''}`}
            >
              <FaTextHeight className={styles.toolIcon} />
              <span>Add Text</span>
            </button>
            <button 
              onClick={() => addShape('rectangle')}
              className={`${styles.toolButton} ${activeTool === 'rectangle' ? styles.active : ''}`}
            >
              <FaSquare className={styles.toolIcon} />
              <span>Rectangle</span>
            </button>
            <button 
              onClick={() => addShape('circle')}
              className={`${styles.toolButton} ${activeTool === 'circle' ? styles.active : ''}`}
            >
              <FaCircle className={styles.toolIcon} />
              <span>Circle</span>
            </button>
            <button 
              onClick={() => addShape('triangle')}
              className={`${styles.toolButton} ${activeTool === 'triangle' ? styles.active : ''}`}
            >
              <MdChangeHistory className={styles.toolIcon} />
              <span>Triangle</span>
            </button>
          </div>
          
          <div className={styles.toolGroup}>
            <div className={styles.colorPicker}>
              <MdColorLens className={styles.colorIcon} />
              <span>Fill:</span>
              <input 
                type="color" 
                value={color} 
                onChange={(e) => changeColor(e.target.value)} 
              />
            </div>
            <div className={styles.colorPicker}>
              <MdColorLens className={styles.colorIcon} />
              <span>Text:</span>
              <input 
                type="color" 
                value={textColor} 
                onChange={(e) => changeTextColor(e.target.value)} 
              />
            </div>
            {showDelete && (
              <button 
                onClick={deleteSelected}
                className={`${styles.toolButton} ${styles.deleteButton}`}
              >
                <MdDelete className={styles.toolIcon} />
                <span>Delete</span>
              </button>
            )}
          </div>
          
          <div className={styles.toolGroup}>
            <button 
              onClick={bringToFront}
              className={styles.toolButton}
            >
              <FaLayerGroup className={styles.toolIcon} />
              <span>Bring Forward</span>
            </button>
            <button 
              onClick={sendToBack}
              className={styles.toolButton}
            >
              <MdOutlineLayers className={styles.toolIcon} />
              <span>Send Backward</span>
            </button>
            <div className={styles.downloadContainer}>
                <button 
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                className={`${styles.toolButton} ${styles.downloadButton}`}
                >
                <FaDownload className={styles.toolIcon} />
                <span>Download</span>
                </button>
                {showDownloadOptions && (
                    <div className={styles.downloadOptions}>
                        <button 
                        onClick={downloadEditedImage}
                        className={styles.downloadOption}
                        >
                        <FaLayerGroup className={styles.toolIcon} />
                        <span>With Edits</span>
                        </button>
                        <button 
                        onClick={downloadOriginalImage}
                        className={styles.downloadOption}
                        >
                        <BiImageAlt className={styles.toolIcon} />
                        <span>Original</span>
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPage;